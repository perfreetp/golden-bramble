// 渲染器:优先 WebGPU(实例化四边形,单次 draw call 绘制全部可见要素),
// 不支持时回退 Canvas2D。两者接口一致:draw(instances, view, cssW, cssH, time)
// instance: { x, y, w, h, color:[r,g,b,a], flags }
// flags 位: 1=选中 2=闪烁 4=悬停 8=仅描边(中距离 LOD)

const WGSL = /* wgsl */ `
struct Uniforms {
  scale: vec2f,   // 世界单位 -> NDC 比例 (scale/cssW, scale/cssH)
  offset: vec2f,  // 视口左上角世界坐标
  time: f32,
  pad: vec3f,
};
@group(0) @binding(0) var<uniform> u: Uniforms;

struct Inst {
  pos: vec2f,
  size: vec2f,
  color: vec4f,
  flags: f32,
  pad0: f32,
  pad1: f32,
  pad2: f32,
};
@group(0) @binding(1) var<storage, read> inst: array<Inst>;

struct VOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
  @location(1) color: vec4f,
  @location(2) flags: f32,
};

@vertex
fn vs(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> VOut {
  var corners = array<vec2f, 6>(
    vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(0.0, 1.0),
    vec2f(0.0, 1.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0)
  );
  let c = corners[vi];
  let it = inst[ii];
  let world = it.pos + c * it.size;
  let ndc = (world - u.offset) * u.scale * vec2f(2.0, -2.0) + vec2f(-1.0, 1.0);
  var o: VOut;
  o.pos = vec4f(ndc, 0.0, 1.0);
  o.uv = c;
  o.color = it.color;
  o.flags = it.flags;
  return o;
}

@fragment
fn fs(v: VOut) -> @location(0) vec4f {
  let f = u32(v.flags);
  var col = v.color;
  // 仅描边:离边缘近的片元才保留
  if ((f & 8u) != 0u) {
    let b = min(min(v.uv.x, 1.0 - v.uv.x), min(v.uv.y, 1.0 - v.uv.y));
    if (b > 0.07) { discard; }
  }
  // 闪烁(搜索定位提示)
  if ((f & 2u) != 0u) {
    let p = 0.5 + 0.5 * sin(u.time * 7.0);
    col = vec4f(mix(col.rgb, vec3f(1.0, 0.15, 0.15), p * 0.75), col.a);
  }
  // 选中高亮
  if ((f & 1u) != 0u) {
    col = vec4f(col.rgb * 1.25 + vec3f(0.12), col.a);
  }
  // 悬停提亮
  if ((f & 4u) != 0u) {
    col = vec4f(col.rgb * 1.15, col.a);
  }
  return col;
}
`

const MAX_INST = 16384
const FLOATS_PER_INST = 12 // 48 字节,与 WGSL 结构体对齐

export async function createRenderer(canvas) {
  try {
    if (navigator.gpu) {
      const adapter = await navigator.gpu.requestAdapter()
      if (adapter) {
        const device = await adapter.requestDevice()
        const ctx = canvas.getContext('webgpu')
        if (ctx) {
          const format = navigator.gpu.getPreferredCanvasFormat()
          ctx.configure({ device, format, alphaMode: 'premultiplied' })
          return new GpuRenderer(device, ctx, format)
        }
      }
    }
  } catch (e) {
    console.warn('WebGPU 初始化失败,回退 Canvas2D:', e)
  }
  return new Canvas2DRenderer(canvas.getContext('2d'))
}

class GpuRenderer {
  constructor(device, ctx, format) {
    this.kind = 'WebGPU'
    this.device = device
    this.ctx = ctx
    const module = device.createShaderModule({ code: WGSL })
    const bindLayout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
        { binding: 1, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
      ],
    })
    this.pipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [bindLayout] }),
      vertex: { module, entryPoint: 'vs' },
      fragment: {
        module, entryPoint: 'fs',
        targets: [{
          format,
          blend: {
            color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha' },
            alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
          },
        }],
      },
      primitive: { topology: 'triangle-list' },
    })
    this.ubo = device.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST })
    this.ibo = device.createBuffer({ size: MAX_INST * FLOATS_PER_INST * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST })
    this.bind = device.createBindGroup({
      layout: bindLayout,
      entries: [{ binding: 0, resource: { buffer: this.ubo } }, { binding: 1, resource: { buffer: this.ibo } }],
    })
    this.arr = new Float32Array(MAX_INST * FLOATS_PER_INST)
    this.uarr = new Float32Array(8)
  }

  draw(instances, view, cssW, cssH, time) {
    const n = Math.min(instances.length, MAX_INST)
    const a = this.arr
    for (let i = 0; i < n; i++) {
      const t = instances[i]
      const o = i * FLOATS_PER_INST
      a[o] = t.x; a[o + 1] = t.y; a[o + 2] = t.w; a[o + 3] = t.h
      a[o + 4] = t.color[0]; a[o + 5] = t.color[1]; a[o + 6] = t.color[2]; a[o + 7] = t.color[3]
      a[o + 8] = t.flags || 0
    }
    this.device.queue.writeBuffer(this.ibo, 0, a, 0, n * FLOATS_PER_INST)
    const u = this.uarr
    u[0] = view.scale / cssW; u[1] = view.scale / cssH
    u[2] = view.ox; u[3] = view.oy; u[4] = time
    this.device.queue.writeBuffer(this.ubo, 0, u)
    const enc = this.device.createCommandEncoder()
    const pass = enc.beginRenderPass({
      colorAttachments: [{
        view: this.ctx.getCurrentTexture().createView(),
        loadOp: 'clear', clearValue: { r: 0.12, g: 0.13, b: 0.16, a: 1 }, storeOp: 'store',
      }],
    })
    pass.setPipeline(this.pipeline)
    pass.setBindGroup(0, this.bind)
    pass.draw(6, n)
    pass.end()
    this.device.queue.submit([enc.finish()])
  }
}

class Canvas2DRenderer {
  constructor(ctx) {
    this.kind = 'Canvas2D'
    this.ctx = ctx
  }
  draw(instances, view, cssW, cssH, time) {
    const c = this.ctx
    const dpr = cssW ? c.canvas.width / cssW : 1
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.fillStyle = '#1f2126'
    c.fillRect(0, 0, c.canvas.width, c.canvas.height)
    for (const t of instances) {
      let [r, g, b, a] = t.color
      const f = t.flags || 0
      if (f & 2) { const p = 0.5 + 0.5 * Math.sin(time * 7); r = r + (1 - r) * p * 0.75; g *= 0.5; b *= 0.5 }
      if (f & 1) { r = Math.min(1, r * 1.25 + 0.12); g = Math.min(1, g * 1.25 + 0.12); b = Math.min(1, b * 1.25 + 0.12) }
      if (f & 4) { r = Math.min(1, r * 1.15); g = Math.min(1, g * 1.15); b = Math.min(1, b * 1.15) }
      const x = (t.x - view.ox) * view.scale * dpr
      const y = (t.y - view.oy) * view.scale * dpr
      const w = t.w * view.scale * dpr
      const h = t.h * view.scale * dpr
      if (f & 8) {
        c.strokeStyle = `rgba(${(r * 255) | 0},${(g * 255) | 0},${(b * 255) | 0},${a})`
        c.lineWidth = Math.max(1, 1.5 * dpr)
        c.strokeRect(x, y, w, h)
      } else {
        c.fillStyle = `rgba(${(r * 255) | 0},${(g * 255) | 0},${(b * 255) | 0},${a})`
        c.fillRect(x, y, w, h)
      }
    }
  }
}
