import type { Camera, RGBA } from '../core/types.js';

/**
 * 2D 即时模式渲染器接口。
 * WebGPU 实现把所有图元转三角形批量提交；
 * Canvas2D 实现保持同名方法，用于无 WebGPU 环境降级与离屏序列帧导出。
 */
export interface Renderer {
  readonly kind: 'webgpu' | 'canvas2d';
  readonly supportsText: boolean;
  resize(cssWidth: number, cssHeight: number, dpr: number): void;
  begin(camera: Camera, background: RGBA): void;
  line(x1: number, y1: number, x2: number, y2: number, color: RGBA, widthPx?: number): void;
  circle(cx: number, cy: number, r: number, color: RGBA, filled: boolean, strokeWidthPx?: number): void;
  arc(cx: number, cy: number, r: number, startRad: number, endRad: number, color: RGBA, widthPx?: number): void;
  rect(x: number, y: number, w: number, h: number, color: RGBA, filled: boolean, strokeWidthPx?: number): void;
  polygon(points: Array<{ x: number; y: number }>, color: RGBA): void;
  text(str: string, x: number, y: number, color: RGBA, sizePx?: number, align?: CanvasTextAlign): void;
  end(): void;
  dispose?(): void;
}

/* ---------------- 颜色工具 ---------------- */

function rgbaParts(c: RGBA): [number, number, number, number] {
  return [((c >>> 24) & 255) / 255, ((c >>> 16) & 255) / 255, ((c >>> 8) & 255) / 255, (c & 255) / 255];
}

function cssColor(c: RGBA): string {
  const r = (c >>> 24) & 255;
  const g = (c >>> 16) & 255;
  const b = (c >>> 8) & 255;
  const a = (c & 255) / 255;
  return `rgba(${r},${g},${b},${a})`;
}

export const COLOR = {
  withAlpha: (rgb: number, alpha: number): RGBA => (rgb << 8) | Math.round(alpha * 255),
  opaque: (rgb: number): RGBA => (rgb << 8) | 255,
};

/* ---------------- WebGPU 实现 ---------------- */

const CIRCLE_SEGMENTS = 28;
const MAX_VERTS_STEP = 1 << 16;

class WebGPURenderer implements Renderer {
  readonly kind = 'webgpu' as const;
  readonly supportsText = false;

  private device: GPUDevice;
  private context: GPUCanvasContext;
  private canvas: HTMLCanvasElement;
  private pipeline: GPURenderPipeline;
  private uniformBuffer: GPUBuffer;
  private vertexBuffer: GPUBuffer;
  private vertexCapacity = MAX_VERTS_STEP;

  private positions: number[] = [];
  private colors: number[] = [];
  private camera: Camera = { x: 0, y: 0, zoom: 1 };
  private bg: RGBA = 0x0f1420ff;
  private cssW = 1;
  private cssH = 1;
  private dpr = 1;

  private constructor(canvas: HTMLCanvasElement, device: GPUDevice, context: GPUCanvasContext, format: GPUTextureFormat) {
    this.canvas = canvas;
    this.device = device;
    this.context = context;
    void format;

    this.uniformBuffer = device.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.vertexBuffer = device.createBuffer({
      size: this.vertexCapacity * 6 * 4,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    const shader = device.createShaderModule({
      code: /* wgsl */ `
        struct Uniforms {
          offsetX: f32, offsetY: f32, zoom: f32,
          halfW: f32, halfH: f32,
          pad0: f32, pad1: f32, pad2: f32,
        }
        @group(0) @binding(0) var<uniform> u: Uniforms;
        struct VOut {
          @builtin(position) pos: vec4f,
          @location(0) color: vec4f,
        }
        @vertex
        fn vs(@location(0) wp: vec2f, @location(1) c: vec4f) -> VOut {
          let sx = wp.x * u.zoom + u.offsetX;
          let sy = wp.y * u.zoom + u.offsetY;
          var out: VOut;
          out.pos = vec4f(sx / u.halfW - 1.0, 1.0 - sy / u.halfH, 0.0, 1.0);
          out.color = vec4f(c.rgb, c.a);
          return out;
        }
        @fragment
        fn fs(in: VOut) -> @location(0) vec4f {
          return in.color;
        }
      `,
    });

    this.pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: shader,
        buffers: [
          {
            arrayStride: 24,
            attributes: [
              { shaderLocation: 0, offset: 0, format: 'float32x2' },
              { shaderLocation: 1, offset: 8, format: 'float32x4' },
            ],
          },
        ],
      },
      fragment: {
        module: shader,
        targets: [{ format, blend: {
          color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
          alpha: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
        } }],
      },
      primitive: { topology: 'triangle-list' },
    });
  }

  static async create(canvas: HTMLCanvasElement): Promise<WebGPURenderer> {
    if (!navigator.gpu) throw new Error('WebGPU 不可用');
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('无可用 GPU 适配器');
    const device = await adapter.requestDevice();
    const context = canvas.getContext('webgpu') as GPUCanvasContext | null;
    if (!context) throw new Error('无法获取 WebGPU 上下文');
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device, format, alphaMode: 'opaque' });
    return new WebGPURenderer(canvas, device, context, format);
  }

  resize(cssWidth: number, cssHeight: number, dpr: number): void {
    this.cssW = cssWidth;
    this.cssH = cssHeight;
    this.dpr = dpr;
    const w = Math.max(1, Math.round(cssWidth * dpr));
    const h = Math.max(1, Math.round(cssHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  begin(camera: Camera, background: RGBA): void {
    this.camera = camera;
    this.bg = background;
    this.positions = [];
    this.colors = [];
  }

  /* ---- 图元转三角形 ---- */

  private pushVertex(x: number, y: number, c: RGBA): void {
    this.positions.push(x, y);
    const [r, g, b, a] = rgbaParts(c);
    this.colors.push(r, g, b, a);
  }

  private tri(
    ax: number, ay: number, bx: number, by: number, cx: number, cy: number, c: RGBA,
  ): void {
    this.pushVertex(ax, ay, c);
    this.pushVertex(bx, by, c);
    this.pushVertex(cx, cy, c);
  }

  line(x1: number, y1: number, x2: number, y2: number, color: RGBA, widthPx = 2): void {
    const halfW = widthPx / 2 / this.camera.zoom;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * halfW;
    const ny = (dx / len) * halfW;
    const p1 = { x: x1 + nx, y: y1 + ny };
    const p2 = { x: x1 - nx, y: y1 - ny };
    const p3 = { x: x2 - nx, y: y2 - ny };
    const p4 = { x: x2 + nx, y: y2 + ny };
    this.tri(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, color);
    this.tri(p1.x, p1.y, p3.x, p3.y, p4.x, p4.y, color);
  }

  circle(cx: number, cy: number, r: number, color: RGBA, filled: boolean, strokeWidthPx = 2): void {
    if (filled) {
      for (let i = 0; i < CIRCLE_SEGMENTS; i++) {
        const a0 = (i / CIRCLE_SEGMENTS) * Math.PI * 2;
        const a1 = ((i + 1) / CIRCLE_SEGMENTS) * Math.PI * 2;
        this.tri(
          cx, cy,
          cx + Math.cos(a0) * r, cy + Math.sin(a0) * r,
          cx + Math.cos(a1) * r, cy + Math.sin(a1) * r,
          color,
        );
      }
    } else {
      const sw = strokeWidthPx / this.camera.zoom;
      for (let i = 0; i < CIRCLE_SEGMENTS; i++) {
        const a0 = (i / CIRCLE_SEGMENTS) * Math.PI * 2;
        const a1 = ((i + 1) / CIRCLE_SEGMENTS) * Math.PI * 2;
        const c0 = Math.cos(a0);
        const s0 = Math.sin(a0);
        const c1 = Math.cos(a1);
        const s1 = Math.sin(a1);
        const o0 = { x: cx + c0 * r, y: cy + s0 * r };
        const i0 = { x: cx + c0 * (r - sw), y: cy + s0 * (r - sw) };
        const o1 = { x: cx + c1 * r, y: cy + s1 * r };
        const i1 = { x: cx + c1 * (r - sw), y: cy + s1 * (r - sw) };
        this.tri(o0.x, o0.y, i0.x, i0.y, i1.x, i1.y, color);
        this.tri(o0.x, o0.y, i1.x, i1.y, o1.x, o1.y, color);
      }
    }
  }

  arc(cx: number, cy: number, r: number, startRad: number, endRad: number, color: RGBA, widthPx = 2): void {
    const sw = widthPx / this.camera.zoom;
    const span = endRad - startRad;
    const steps = Math.max(6, Math.ceil(Math.abs(span) / (Math.PI * 2) * CIRCLE_SEGMENTS * 2));
    for (let i = 0; i < steps; i++) {
      const a0 = startRad + (i / steps) * span;
      const a1 = startRad + ((i + 1) / steps) * span;
      const c0 = Math.cos(a0);
      const s0 = Math.sin(a0);
      const c1 = Math.cos(a1);
      const s1 = Math.sin(a1);
      const o0 = { x: cx + c0 * r, y: cy + s0 * r };
      const i0 = { x: cx + c0 * (r - sw), y: cy + s0 * (r - sw) };
      const o1 = { x: cx + c1 * r, y: cy + s1 * r };
      const i1 = { x: cx + c1 * (r - sw), y: cy + s1 * (r - sw) };
      this.tri(o0.x, o0.y, i0.x, i0.y, i1.x, i1.y, color);
      this.tri(o0.x, o0.y, i1.x, i1.y, o1.x, o1.y, color);
    }
  }

  rect(x: number, y: number, w: number, h: number, color: RGBA, filled: boolean, strokeWidthPx = 2): void {
    if (filled) {
      this.tri(x, y, x, y + h, x + w, y + h, color);
      this.tri(x, y, x + w, y + h, x + w, y, color);
    } else {
      const sw = strokeWidthPx / this.camera.zoom;
      this.line(x, y, x + w, y, color, strokeWidthPx);
      this.line(x + w, y, x + w, y + h, color, strokeWidthPx);
      this.line(x + w, y + h, x, y + h, color, strokeWidthPx);
      this.line(x, y + h, x, y, color, strokeWidthPx);
      void sw;
    }
  }

  polygon(points: Array<{ x: number; y: number }>, color: RGBA): void {
    for (let i = 1; i < points.length - 1; i++) {
      this.tri(
        points[0].x, points[0].y,
        points[i].x, points[i].y,
        points[i + 1].x, points[i + 1].y,
        color,
      );
    }
  }

  text(): void {
    /* WebGPU 后端不绘制文字（交互提示由 DOM 层承担） */
  }

  end(): void {
    const vertCount = this.positions.length / 2;
    if (vertCount === 0) {
      // 仍需清屏
      this.renderEmpty();
      return;
    }
    const needed = vertCount * 6 * 4;
    if (needed > this.vertexBuffer.size) {
      this.vertexBuffer.destroy();
      this.vertexCapacity = Math.ceil(vertCount / MAX_VERTS_STEP) * MAX_VERTS_STEP;
      this.vertexBuffer = this.device.createBuffer({
        size: this.vertexCapacity * 6 * 4,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
    }
    const interleaved = new Float32Array(vertCount * 6);
    for (let i = 0; i < vertCount; i++) {
      interleaved[i * 6] = this.positions[i * 2];
      interleaved[i * 6 + 1] = this.positions[i * 2 + 1];
      interleaved[i * 6 + 2] = this.colors[i * 4];
      interleaved[i * 6 + 3] = this.colors[i * 4 + 1];
      interleaved[i * 6 + 4] = this.colors[i * 4 + 2];
      interleaved[i * 6 + 5] = this.colors[i * 4 + 3];
    }
    this.device.queue.writeBuffer(this.vertexBuffer, 0, interleaved);

    const uniform = new Float32Array(8);
    uniform[0] = this.camera.x * this.dpr;
    uniform[1] = this.camera.y * this.dpr;
    uniform[2] = this.camera.zoom * this.dpr;
    uniform[3] = (this.cssW * this.dpr) / 2;
    uniform[4] = (this.cssH * this.dpr) / 2;
    this.device.queue.writeBuffer(this.uniformBuffer, 0, uniform);

    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: this.context.getCurrentTexture().createView(),
        clearValue: rgbaClear(this.bg),
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }],
    }));
    pass.setVertexBuffer(0, this.vertexBuffer);
    pass.draw(vertCount);
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  private renderEmpty(): void {
    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: this.context.getCurrentTexture().createView(),
        clearValue: rgbaClear(this.bg),
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  dispose(): void {
    this.vertexBuffer.destroy();
    this.uniformBuffer.destroy();
  }
}

function rgbaClear(c: RGBA): GPUColor {
  const [r, g, b, a] = rgbaParts(c);
  return { r, g, b, a };
}

/* ---------------- Canvas2D 实现 ---------------- */

class Canvas2DRenderer implements Renderer {
  readonly kind = 'canvas2d' as const;
  readonly supportsText = true;

  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement | OffscreenCanvas;
  private camera: Camera = { x: 0, y: 0, zoom: 1 };

  constructor(canvas: HTMLCanvasElement | OffscreenCanvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  resize(cssWidth: number, cssHeight: number, dpr: number): void {
    const w = Math.max(1, Math.round(cssWidth * dpr));
    const h = Math.max(1, Math.round(cssHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  begin(camera: Camera, background: RGBA): void {
    this.camera = camera;
    const ctx = this.ctx;
    const w = this.canvas.width / (ctx.getTransform().a || 1);
    const h = this.canvas.height / (ctx.getTransform().d || 1);
    ctx.fillStyle = cssColor(background);
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  line(x1: number, y1: number, x2: number, y2: number, color: RGBA, widthPx = 2): void {
    const ctx = this.ctx;
    ctx.strokeStyle = cssColor(color);
    ctx.lineWidth = widthPx / this.camera.zoom;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  circle(cx: number, cy: number, r: number, color: RGBA, filled: boolean, strokeWidthPx = 2): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (filled) {
      ctx.fillStyle = cssColor(color);
      ctx.fill();
    } else {
      ctx.strokeStyle = cssColor(color);
      ctx.lineWidth = strokeWidthPx / this.camera.zoom;
      ctx.stroke();
    }
  }

  arc(cx: number, cy: number, r: number, startRad: number, endRad: number, color: RGBA, widthPx = 2): void {
    const ctx = this.ctx;
    ctx.strokeStyle = cssColor(color);
    ctx.lineWidth = widthPx / this.camera.zoom;
    ctx.beginPath();
    ctx.arc(cx, cy, r, startRad, endRad);
    ctx.stroke();
  }

  rect(x: number, y: number, w: number, h: number, color: RGBA, filled: boolean, strokeWidthPx = 2): void {
    const ctx = this.ctx;
    if (filled) {
      ctx.fillStyle = cssColor(color);
      ctx.fillRect(x, y, w, h);
    } else {
      ctx.strokeStyle = cssColor(color);
      ctx.lineWidth = strokeWidthPx / this.camera.zoom;
      ctx.strokeRect(x, y, w, h);
    }
  }

  polygon(points: Array<{ x: number; y: number }>, color: RGBA): void {
    const ctx = this.ctx;
    ctx.fillStyle = cssColor(color);
    ctx.beginPath();
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.fill();
  }

  text(str: string, x: number, y: number, color: RGBA, sizePx = 12, align: CanvasTextAlign = 'center'): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.scale(1 / this.camera.zoom, 1 / this.camera.zoom);
    ctx.fillStyle = cssColor(color);
    ctx.font = `${sizePx}px "Segoe UI", "PingFang SC", system-ui, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(str, x * this.camera.zoom, y * this.camera.zoom);
    ctx.restore();
  }

  end(): void {
    this.ctx.restore();
  }
}

/* ---------------- 工厂 ---------------- */

export async function createRenderer(canvas: HTMLCanvasElement): Promise<Renderer> {
  try {
    return await WebGPURenderer.create(canvas);
  } catch (e) {
    console.warn('[renderer] 降级到 Canvas2D：', e);
    return new Canvas2DRenderer(canvas);
  }
}

export function createOffscreenRenderer(width: number, height: number): { renderer: Renderer; canvas: OffscreenCanvas } {
  const canvas = new OffscreenCanvas(width, height);
  return { renderer: new Canvas2DRenderer(canvas), canvas };
}
