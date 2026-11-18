import type { Keyframe, Project } from '../core/types.js';
import { h, clear, SHARED_CSS } from './dom.js';
import { trackOf, velocityAt } from '../anim/timeline.js';
import { cubicBezierSlope, easingAt } from '../core/easing.js';
import { DEFAULT_BEZIER } from '../anim/timeline.js';

interface CurveEvents {
  /** 结构性变更（切插值类型、选段）：需要重渲染 */
  onChange: () => void;
  /** 拖拽手柄中的高频变更：只持久化，不要重建面板，否则会打断拖拽 */
  onPersist?: () => void;
  /** 段切换：同步编辑器播放头到指定帧 */
  onSeek?: (frame: number) => void;
}

const SIZE = 220;
const PAD = 26;

export class PanelCurve extends HTMLElement {
  private project: Project | null = null;
  private selectedBoneId: string | null = null;
  private currentFrame = 0;
  private events: CurveEvents | null = null;
  private canvas!: HTMLCanvasElement;
  private info!: HTMLDivElement;
  private draggingHandle: 1 | 2 | null = null;
  private dragSegment: { a: Keyframe; b: Keyframe } | null = null;

  connectedCallback(): void {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = /* html */ `
      <style>
        ${SHARED_CSS}
        :host { display: flex; flex-direction: column; height: 100%; }
        .head { padding: 10px 12px; border-bottom: 1px solid var(--border); font-weight: 600; font-size: 13px; flex: none; }
        .body { padding: 12px; overflow: auto; flex: 1; }
        canvas { background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-sm); touch-action: none; cursor: crosshair; width: 100%; max-width: 240px; height: auto; aspect-ratio: 1; }
        .info { margin-top: 10px; font-size: 12px; color: var(--fg-dim); display: flex; flex-direction: column; gap: 6px; }
        .info b { color: var(--fg); font-family: var(--mono, monospace); }
        .seg-list { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
        .seg-item {
          font-size: 12px; padding: 6px 8px; border-radius: var(--radius-sm);
          border: 1px solid var(--border); cursor: pointer; display: flex; justify-content: space-between;
        }
        .seg-item.sel { border-color: var(--accent); background: var(--accent-soft); }
        .empty { color: var(--fg-faint); font-size: 12px; text-align: center; padding: 24px 8px; }
        select { width: 100%; margin-top: 8px; }
      </style>
      <div class="head">📈 插值曲线与速度</div>
      <div class="body" id="body">
        <div class="empty">选择一根骨骼并在时间轴上打点后，可在此编辑段插值曲线</div>
      </div>
    `;
  }

  setProject(project: Project): void {
    this.project = project;
    this.render();
  }

  setSelectedBone(boneId: string | null): void {
    this.selectedBoneId = boneId;
    this.render();
  }

  setFrame(frame: number): void {
    this.currentFrame = frame;
    this.updateInfo();
  }

  setEvents(events: CurveEvents): void {
    this.events = events;
  }

  /** 当前编辑的段（播放头所在段） */
  private currentSegment(): { a: Keyframe; b: Keyframe } | null {
    if (!this.project || !this.selectedBoneId) return null;
    const track = trackOf(this.project, this.selectedBoneId);
    if (track.length < 2) return null;
    for (let i = 0; i < track.length - 1; i++) {
      if (this.currentFrame >= track[i].frame && this.currentFrame < track[i + 1].frame) {
        return { a: track[i], b: track[i + 1] };
      }
    }
    // 播放头落在末帧时回退到最后一段
    const last = track[track.length - 1];
    if (this.currentFrame >= last.frame && track.length >= 2) {
      return { a: track[track.length - 2], b: last };
    }
    return null;
  }

  private render(): void {
    const host = this.shadowRoot!.querySelector('#body')!;
    clear(host);
    if (!this.project || !this.selectedBoneId) {
      host.appendChild(h('div', { class: 'empty', textContent: '请先在视口或层级面板选择一根骨骼' }));
      return;
    }
    const track = trackOf(this.project, this.selectedBoneId);
    if (track.length < 2) {
      host.appendChild(h('div', { class: 'empty', textContent: '该骨骼至少需要 2 个关键帧才能编辑段曲线' }));
      return;
    }

    const seg = this.currentSegment();
    // 段选择
    const segList = h('div', { class: 'seg-list' });
    for (let i = 0; i < track.length - 1; i++) {
      const a = track[i];
      const b = track[i + 1];
      const isSel = seg?.a.id === a.id;
      segList.appendChild(h('div', {
        class: `seg-item${isSel ? ' sel' : ''}`,
        onclick: () => {
          this.currentFrame = a.frame;
          this.events?.onSeek?.(a.frame);
          this.render();
          this.events?.onChange();
        },
      }, [
        h('span', { textContent: `第 ${a.frame} → ${b.frame} 帧` }),
        h('span', { textContent: `${a.angle.toFixed(0)}° → ${b.angle.toFixed(0)}°` }),
      ]));
    }
    host.appendChild(segList);

    if (!seg) {
      host.appendChild(h('div', { class: 'empty', textContent: '播放头未落在任何段内' }));
      return;
    }

    // 插值类型
    const select = h('select', {
      onchange: (e: Event) => {
        const kind = (e.target as HTMLSelectElement).value as Keyframe['easing'];
        seg.a.easing = kind;
        if (kind === 'bezier' && !seg.a.bezier) seg.a.bezier = { ...DEFAULT_BEZIER };
        this.events?.onChange();
        this.render();
      },
    }, [
      h('option', { value: 'linear', textContent: '线性（Linear）', selected: seg.a.easing === 'linear' }),
      h('option', { value: 'easeInOut', textContent: '缓入缓出（Ease In-Out）', selected: seg.a.easing === 'easeInOut' }),
      h('option', { value: 'bezier', textContent: '自定义贝塞尔（拖动手柄）', selected: seg.a.easing === 'bezier' }),
    ]);
    host.appendChild(select);

    this.canvas = h('canvas', { width: SIZE, height: SIZE });
    host.appendChild(this.canvas);
    this.info = h('div', { class: 'info' });
    host.appendChild(this.info);

    this.canvas.addEventListener('pointerdown', (e) => this.startDrag(e));
    this.canvas.addEventListener('pointermove', (e) => this.drag(e));
    this.canvas.addEventListener('pointerup', () => { this.draggingHandle = null; this.dragSegment = null; });
    this.canvas.addEventListener('pointercancel', () => { this.draggingHandle = null; this.dragSegment = null; });

    this.drawCurve(seg);
    this.updateInfo();
  }

  private toCanvas(x: number, y: number): { x: number; y: number } {
    return { x: PAD + x * (SIZE - PAD * 2), y: SIZE - PAD - y * (SIZE - PAD * 2) };
  }

  private fromCanvas(cx: number, cy: number): { x: number; y: number } {
    return {
      x: Math.min(1, Math.max(0, (cx - PAD) / (SIZE - PAD * 2))),
      y: Math.min(1, Math.max(0, (SIZE - PAD - cy) / (SIZE - PAD * 2))),
    };
  }

  private drawCurve(seg: { a: Keyframe; b: Keyframe }): void {
    const ctx = this.canvas.getContext('2d')!;
    ctx.clearRect(0, 0, SIZE, SIZE);
    // 网格
    ctx.strokeStyle = '#222c44';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const g = PAD + (i / 4) * (SIZE - PAD * 2);
      ctx.beginPath(); ctx.moveTo(g, PAD); ctx.lineTo(g, SIZE - PAD); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PAD, g); ctx.lineTo(SIZE - PAD, g); ctx.stroke();
    }
    // 对角线参考
    const p0 = this.toCanvas(0, 0);
    const p3 = this.toCanvas(1, 1);
    ctx.strokeStyle = '#3d4d72';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p3.x, p3.y); ctx.stroke();
    ctx.setLineDash([]);

    // 主曲线：按当前 easing 采样 60 段
    ctx.strokeStyle = '#4f8cff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const y = easingAt(seg.a.easing, seg.a.bezier, t);
      const p = this.toCanvas(t, y);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // 贝塞尔手柄与控制多边形
    if (seg.a.easing === 'bezier') {
      const bz = seg.a.bezier ?? { ...DEFAULT_BEZIER };
      const c1 = this.toCanvas(bz.x1, bz.y1);
      const c2 = this.toCanvas(bz.x2, bz.y2);
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y); ctx.lineTo(c1.x, c1.y);
      ctx.moveTo(p3.x, p3.y); ctx.lineTo(c2.x, c2.y);
      ctx.stroke();
      for (const [c, label] of [[c1, 'P1'], [c2, 'P2']] as const) {
        ctx.fillStyle = '#a78bfa';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e6ecf7';
        ctx.font = '10px Consolas';
        ctx.textAlign = 'center';
        ctx.fillText(label, c.x, c.y - 10);
      }
    }
    // 轴标签
    ctx.fillStyle = '#64718c';
    ctx.font = '10px Consolas';
    ctx.textAlign = 'center';
    ctx.fillText('帧进度 t →', SIZE / 2, SIZE - 6);
    ctx.save();
    ctx.translate(9, SIZE / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('插值进度', 0, 0);
    ctx.restore();
  }

  /** 指针坐标 → 画布内部坐标（处理 CSS 尺寸与属性尺寸不一致的缩放） */
  private toInternal(e: PointerEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * SIZE,
      y: ((e.clientY - rect.top) / rect.height) * SIZE,
    };
  }

  private startDrag(e: PointerEvent): void {
    const seg = this.currentSegment();
    if (!seg || seg.a.easing !== 'bezier') return;
    const { x: cx, y: cy } = this.toInternal(e);
    const bz = seg.a.bezier ?? { ...DEFAULT_BEZIER };
    const c1 = this.toCanvas(bz.x1, bz.y1);
    const c2 = this.toCanvas(bz.x2, bz.y2);
    if (Math.hypot(cx - c1.x, cy - c1.y) < 16) {
      this.draggingHandle = 1;
      this.dragSegment = seg;
    } else if (Math.hypot(cx - c2.x, cy - c2.y) < 16) {
      this.draggingHandle = 2;
      this.dragSegment = seg;
    }
  }

  private drag(e: PointerEvent): void {
    if (!this.draggingHandle || !this.dragSegment) return;
    const seg = this.dragSegment;
    const internal = this.toInternal(e);
    const pt = this.fromCanvas(internal.x, internal.y);
    if (!seg.a.bezier) seg.a.bezier = { ...DEFAULT_BEZIER };
    if (this.draggingHandle === 1) {
      seg.a.bezier.x1 = pt.x;
      seg.a.bezier.y1 = pt.y;
    } else {
      seg.a.bezier.x2 = pt.x;
      seg.a.bezier.y2 = pt.y;
    }
    this.drawCurve(seg);
    this.updateInfo();
    if (this.events?.onPersist) this.events.onPersist();
    else this.events?.onChange();
  }

  private updateInfo(): void {
    if (!this.info || !this.project || !this.selectedBoneId) return;
    const seg = this.currentSegment();
    clear(this.info);
    const v = velocityAt(this.project, this.selectedBoneId, this.currentFrame);
    this.info.appendChild(h('div', { innerHTML: `当前帧角速度：<b>${v.toFixed(2)}°/帧</b>` }));
    if (seg) {
      const span = seg.b.frame - seg.a.frame;
      const avg = span === 0 ? 0 : (seg.b.angle - seg.a.angle) / span;
      this.info.appendChild(h('div', { innerHTML: `段平均速度：<b>${avg.toFixed(2)}°/帧</b>` }));
      if (seg.a.easing === 'bezier' && seg.a.bezier) {
        const t = span === 0 ? 0 : (this.currentFrame - seg.a.frame) / span;
        const slope = cubicBezierSlope(seg.a.bezier, Math.min(1, Math.max(0, t)));
        this.info.appendChild(h('div', { innerHTML: `贝塞尔斜率（相对速度）：<b>${slope.toFixed(2)}×</b>` }));
        this.info.appendChild(h('div', {
          innerHTML: `手柄 P1(${(seg.a.bezier.x1).toFixed(2)}, ${seg.a.bezier.y1.toFixed(2)}) · P2(${seg.a.bezier.x2.toFixed(2)}, ${seg.a.bezier.y2.toFixed(2)})`,
        }));
      }
      // 迷你速度曲线：段内逐帧速度
      const speeds: number[] = [];
      for (let f = seg.a.frame; f <= seg.b.frame; f++) {
        speeds.push(velocityAt(this.project, this.selectedBoneId, f));
      }
      const max = Math.max(1, ...speeds.map((s) => Math.abs(s)));
      const bars = h('div', { style: 'display:flex;align-items:flex-end;gap:2px;height:46px;margin-top:4px' });
      speeds.forEach((s) => {
        bars.appendChild(h('div', {
          style: `width:${Math.max(3, 160 / speeds.length - 2)}px;height:${Math.abs(s) / max * 100}%;background:${s < 0 ? '#ff5d6c' : '#35c98f'};border-radius:2px`,
          title: `${s.toFixed(2)}°/帧`,
        }));
      });
      this.info.appendChild(h('label', { textContent: '段内逐帧速度分布' }));
      this.info.appendChild(bars);
    }
  }
}
