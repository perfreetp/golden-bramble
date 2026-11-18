import type { Camera, Project } from '../core/types.js';
import { screenToWorld } from '../core/math.js';
import { createRenderer, COLOR, type Renderer } from '../gpu/renderer.js';
import {
  solveFK, hitTest, pointerLocalAngle, dragAngle, descendants,
} from '../skeleton/skeleton.js';
import { drawRobot, drawGrid } from '../skeleton/draw.js';

interface ViewportEvents {
  onSelect: (boneId: string | null) => void;
  onDragAngle: (info: { boneId: string; angle: number; raw: number; blocked: boolean; side?: 'min' | 'max' }) => void;
  onDragEnd: () => void;
}

export class EditorViewport extends HTMLElement {
  private canvas!: HTMLCanvasElement;
  private renderer: Renderer | null = null;
  private project: Project | null = null;
  private currentFrame = 0;
  private selectedId: string | null = null;
  private blockedId: string | null = null;
  private tempAngles: Map<string, number> = new Map();
  private camera: Camera = { x: 260, y: 420, zoom: 1 };
  private dragging = false;
  private panning = false;
  private lastPointer = { x: 0, y: 0 };
  private raf = 0;
  private events: ViewportEvents | null = null;
  private statusEl!: HTMLDivElement;
  private rendererKindEl!: HTMLSpanElement;

  connectedCallback(): void {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = /* html */ `
      <style>
        :host { display: block; position: relative; width: 100%; height: 100%; overflow: hidden; background: #0f1420; }
        canvas { display: block; width: 100%; height: 100%; touch-action: none; cursor: default; }
        .status {
          position: absolute; left: 12px; top: 10px;
          display: flex; gap: 10px; align-items: center;
          pointer-events: none; font-size: 12px;
        }
        .pill {
          background: rgba(23,30,46,.85); border: 1px solid var(--border);
          border-radius: 999px; padding: 4px 10px; color: var(--fg-dim);
        }
        .pill.warn { color: var(--warn); border-color: var(--warn); }
        .hint {
          position: absolute; right: 12px; bottom: 10px;
          background: rgba(23,30,46,.85); border: 1px solid var(--border);
          border-radius: 999px; padding: 5px 12px; color: var(--fg-faint);
          font-size: 11px; pointer-events: none;
        }
      </style>
      <div class="status">
        <span class="pill" id="renderer-kind">渲染器初始化中…</span>
        <span class="pill" id="status" hidden></span>
      </div>
      <canvas></canvas>
      <div class="hint">点选骨骼 · 拖拽旋转（吸附 5°）· 滚轮缩放 · 右键/中键平移</div>
    `;
    this.canvas = root.querySelector('canvas')!;
    this.statusEl = root.querySelector('#status')!;
    this.rendererKindEl = root.querySelector('#renderer-kind')!;

    // WebGPU 设备初始化是异步的，但 connectedCallback 必须同步返回以保证自定义元素立即完成升级
    this.initRenderer();
    this.bindEvents();
    const loop = (): void => {
      this.render();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private async initRenderer(): Promise<void> {
    try {
      this.renderer = await createRenderer(this.canvas);
      this.rendererKindEl.textContent = this.renderer.kind === 'webgpu'
        ? '⚡ WebGPU 渲染'
        : '🖼 Canvas2D 降级渲染';
    } catch (e) {
      this.rendererKindEl.textContent = '渲染器初始化失败';
      console.error(e);
    }
  }

  disconnectedCallback(): void {
    cancelAnimationFrame(this.raf);
    this.renderer?.dispose?.();
  }

  setEvents(events: ViewportEvents): void {
    this.events = events;
  }

  setProject(project: Project): void {
    this.project = project;
  }

  setFrame(frame: number): void {
    this.currentFrame = frame;
  }

  /** 拖拽过程中尚未落帧的临时角度 */
  setTempAngles(temp: Map<string, number>): void {
    this.tempAngles = temp;
  }

  setSelected(boneId: string | null): void {
    this.selectedId = boneId;
  }

  resetCamera(): void {
    this.camera = { x: 260, y: 420, zoom: 1 };
  }

  private bindEvents(): void {
    const c = this.canvas;
    c.addEventListener('pointerdown', (e) => {
      try {
        c.setPointerCapture(e.pointerId);
      } catch {
        // 合成事件或指针已释放时忽略，不影响后续逻辑
      }
      this.lastPointer = { x: e.offsetX, y: e.offsetY };
      if (e.button === 1 || e.button === 2) {
        this.panning = true;
        c.style.cursor = 'grabbing';
        return;
      }
      const hit = this.pickBone(e.offsetX, e.offsetY);
      this.selectedId = hit;
      this.events?.onSelect(hit);
      if (hit) {
        this.dragging = true;
        this.applyDrag(e.offsetX, e.offsetY);
      }
    });

    c.addEventListener('pointermove', (e) => {
      if (this.panning) {
        this.camera.x += e.offsetX - this.lastPointer.x;
        this.camera.y += e.offsetY - this.lastPointer.y;
        this.lastPointer = { x: e.offsetX, y: e.offsetY };
        return;
      }
      if (this.dragging) this.applyDrag(e.offsetX, e.offsetY);
      this.lastPointer = { x: e.offsetX, y: e.offsetY };
    });

    const end = (): void => {
      if (this.dragging) this.events?.onDragEnd();
      this.dragging = false;
      this.panning = false;
      this.blockedId = null;
      c.style.cursor = 'default';
      this.statusEl.hidden = true;
    };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
    c.addEventListener('contextmenu', (e) => e.preventDefault());

    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const newZoom = Math.min(3, Math.max(0.3, this.camera.zoom * factor));
      // 以指针为缩放中心
      const wx = (e.offsetX - this.camera.x) / this.camera.zoom;
      const wy = (e.offsetY - this.camera.y) / this.camera.zoom;
      this.camera.zoom = newZoom;
      this.camera.x = e.offsetX - wx * newZoom;
      this.camera.y = e.offsetY - wy * newZoom;
    }, { passive: false });
  }

  private currentAngles(): Map<string, number> {
    if (!this.project) return new Map();
    const angles = new Map<string, number>();
    for (const bone of this.project.skeleton) {
      const track = this.project.keyframes
        .filter((k) => k.boneId === bone.id)
        .sort((a, b) => a.frame - b.frame);
      const temp = this.tempAngles.get(bone.id);
      if (temp !== undefined) {
        angles.set(bone.id, temp);
        continue;
      }
      if (track.length === 0) {
        angles.set(bone.id, bone.restAngle);
        continue;
      }
      // 内联轻量采样，避免组件层依赖 timeline 全部工具
      let val = track[0].angle;
      if (this.currentFrame >= track[track.length - 1].frame) {
        val = track[track.length - 1].angle;
      } else {
        for (let i = 0; i < track.length - 1; i++) {
          if (this.currentFrame >= track[i].frame && this.currentFrame <= track[i + 1].frame) {
            const a = track[i];
            const b = track[i + 1];
            const t = b.frame === a.frame ? 1 : (this.currentFrame - a.frame) / (b.frame - a.frame);
            val = a.angle + (b.angle - a.angle) * t;
            break;
          }
        }
      }
      angles.set(bone.id, val);
    }
    return angles;
  }

  private pickBone(sx: number, sy: number): string | null {
    if (!this.project) return null;
    const w = screenToWorld(sx, sy, this.camera);
    const pose = solveFK(this.project.skeleton, this.currentAngles());
    return hitTest(pose, w);
  }

  private applyDrag(sx: number, sy: number): void {
    if (!this.project || !this.selectedId) return;
    const bone = this.project.skeleton.find((b) => b.id === this.selectedId);
    if (!bone) return;
    const w = screenToWorld(sx, sy, this.camera);
    const pose = solveFK(this.project.skeleton, this.currentAngles());
    const raw = pointerLocalAngle(pose, bone.id, w);
    const result = dragAngle(bone, raw, 5);

    this.blockedId = result.blocked ? bone.id : null;
    if (result.blocked) {
      const limit = result.side === 'min' ? bone.limit.min : bone.limit.max;
      this.statusEl.hidden = false;
      this.statusEl.className = 'pill warn';
      this.statusEl.textContent = `⛔ 已达旋转限位 ${limit}°（拖动被卡住）`;
    } else {
      this.statusEl.hidden = true;
    }
    this.events?.onDragAngle({
      boneId: bone.id,
      angle: result.angle,
      raw,
      blocked: result.blocked,
      side: result.side,
    });
  }

  private render(): void {
    const r = this.renderer;
    if (!r || !this.project) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    r.resize(rect.width, rect.height, dpr);
    const pose = solveFK(this.project.skeleton, this.currentAngles());
    r.begin(this.camera, COLOR.opaque(0x0f1420));
    drawGrid(r, rect.width, rect.height, this.camera);
    drawRobot(r, this.project.skeleton, pose, {
      selectedId: this.selectedId,
      blockedId: this.blockedId,
      showLimits: true,
    });
    // 联动提示：选中骨骼的后代描边
    if (this.selectedId) {
      const kids = descendants(this.project.skeleton, this.selectedId);
      for (const id of kids) {
        const p = pose.byId.get(id);
        if (p) r.circle(p.start.x, p.start.y, 9, COLOR.withAlpha(0x4f8cff, 0.5), false, 2);
      }
    }
    r.end();
  }
}
