import type { Keyframe, Project } from '../core/types.js';
import { SHARED_CSS, toast } from './dom.js';
import {
  copyKeyframes, pasteKeyframes, shiftKeyframes, trackOf,
  detectJumpFrames, type ClipboardItem,
} from '../anim/timeline.js';

interface TimelineEvents {
  onFrameChange: (frame: number) => void;
  onPlayState: (playing: boolean) => void;
  onChange: () => void;
}

const ROW_H = 30;
const LABEL_W = 118;
const FRAME_W = 14;

export class PanelTimeline extends HTMLElement {
  private project: Project | null = null;
  private currentFrame = 0;
  private playing = false;
  private selectedKf = new Set<string>();
  private clipboard: ClipboardItem[] = [];
  private events: TimelineEvents | null = null;
  private jumpFrames = new Set<number>();
  private tolerance = 14;

  private ruler!: HTMLCanvasElement;
  private track!: HTMLCanvasElement;
  private playBtn!: HTMLButtonElement;
  private frameInput!: HTMLInputElement;
  private rafId = 0;
  private lastTickTime = 0;

  connectedCallback(): void {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = /* html */ `
      <style>
        ${SHARED_CSS}
        :host { display: flex; flex-direction: column; height: 100%; background: var(--bg-panel); }
        .toolbar {
          display: flex; align-items: center; gap: 8px; padding: 8px 10px;
          border-bottom: 1px solid var(--border); flex: none; flex-wrap: wrap;
        }
        .toolbar .grp { display: flex; align-items: center; gap: 5px; }
        .toolbar .sep { width: 1px; height: 20px; background: var(--border); margin: 0 4px; }
        .toolbar input[type="number"] { width: 64px; }
        .toolbar label { white-space: nowrap; }
        #frame-val { font-family: var(--mono, monospace); color: var(--accent); min-width: 52px; }
        .canvas-wrap { flex: 1; overflow: auto; position: relative; }
        .inner { position: relative; }
        canvas { display: block; }
        #ruler { position: sticky; top: 0; z-index: 2; background: var(--bg-panel); }
        .legend { display: flex; gap: 12px; font-size: 11px; color: var(--fg-faint); padding: 4px 10px; border-top: 1px solid var(--border); flex: none; }
        .legend i { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 4px; }
      </style>
      <div class="toolbar">
        <div class="grp">
          <button class="primary" id="play">▶ 播放</button>
          <button id="stop" title="回到第 0 帧">⏹</button>
          <label>帧 <span id="frame-val">0</span> / <span id="frame-max">0</span></label>
        </div>
        <div class="sep"></div>
        <div class="grp">
          <button id="add-kf" title="在播放头处为选中骨骼打点">◆ 打关键帧</button>
          <button id="del-kf">删除选中</button>
        </div>
        <div class="sep"></div>
        <div class="grp">
          <button id="copy">复制</button>
          <button id="paste">粘贴到播放头</button>
        </div>
        <div class="sep"></div>
        <div class="grp">
          <label>整体平移</label>
          <input type="number" id="shift-n" value="1" step="1" />
          <button id="shift-left">←</button>
          <button id="shift-right">→</button>
        </div>
        <div class="sep"></div>
        <div class="grp">
          <label>FPS</label>
          <input type="number" id="fps" min="1" max="60" />
          <label>总帧数</label>
          <input type="number" id="frame-count" min="2" max="600" />
        </div>
      </div>
      <div class="canvas-wrap" id="wrap">
        <div class="inner" id="inner">
          <canvas id="ruler"></canvas>
          <canvas id="track"></canvas>
        </div>
      </div>
      <div class="legend">
        <span><i style="background:#4f8cff"></i>关键帧</span>
        <span><i style="background:#ff5d6c"></i>速度跳变帧</span>
        <span>点击轨道定位播放头 · 点击菱形选中（Shift 多选）· 双击空白为选中骨骼打点</span>
      </div>
    `;

    this.ruler = root.querySelector('#ruler')!;
    this.track = root.querySelector('#track')!;
    this.playBtn = root.querySelector('#play')!;
    this.frameInput = root.querySelector('#frame-val')!;

    root.querySelector('#play')!.addEventListener('click', () => this.togglePlay());
    root.querySelector('#stop')!.addEventListener('click', () => this.stop());
    root.querySelector('#add-kf')!.addEventListener('click', () => this.addAtPlayhead());
    root.querySelector('#del-kf')!.addEventListener('click', () => this.deleteSelected());
    root.querySelector('#copy')!.addEventListener('click', () => this.copySel());
    root.querySelector('#paste')!.addEventListener('click', () => this.pasteAtPlayhead());
    root.querySelector('#shift-left')!.addEventListener('click', () => this.shift(-1));
    root.querySelector('#shift-right')!.addEventListener('click', () => this.shift(1));
    root.querySelector<HTMLInputElement>('#fps')!.addEventListener('change', (e) => {
      if (!this.project) return;
      this.project.fps = Math.min(60, Math.max(1, Number((e.target as HTMLInputElement).value) || 12));
      this.events?.onChange();
      this.render();
    });
    root.querySelector<HTMLInputElement>('#frame-count')!.addEventListener('change', (e) => {
      if (!this.project) return;
      const n = Math.min(600, Math.max(2, Number((e.target as HTMLInputElement).value) || 72));
      this.project.frameCount = n;
      this.project.keyframes = this.project.keyframes.filter((k) => k.frame < n);
      this.currentFrame = Math.min(this.currentFrame, n - 1);
      this.events?.onFrameChange(this.currentFrame);
      this.events?.onChange();
      this.render();
    });

    this.track.addEventListener('pointerdown', (e) => this.onTrackPointer(e));
    this.ruler.addEventListener('pointerdown', (e) => {
      const frame = this.xToFrame(e.offsetX);
      this.seek(frame);
    });
  }

  disconnectedCallback(): void {
    cancelAnimationFrame(this.rafId);
  }

  setProject(project: Project, jumpTolerance: number): void {
    this.project = project;
    this.tolerance = jumpTolerance;
    this.currentFrame = 0;
    this.selectedKf.clear();
    this.refreshJumps();
    this.render();
  }

  setEvents(events: TimelineEvents): void {
    this.events = events;
  }

  setFrame(frame: number): void {
    this.currentFrame = Math.max(0, Math.min(frame, (this.project?.frameCount ?? 1) - 1));
    this.drawPlayhead();
  }

  refreshJumps(): void {
    if (!this.project) return;
    this.jumpFrames = new Set(detectJumpFrames(this.project, this.tolerance));
  }

  private canvasWidth(): number {
    return LABEL_W + (this.project?.frameCount ?? 72) * FRAME_W + 40;
  }

  private canvasHeight(): number {
    return (this.project?.skeleton.length ?? 1) * ROW_H + 8;
  }

  private frameToX(frame: number): number {
    return LABEL_W + frame * FRAME_W + FRAME_W / 2;
  }

  private xToFrame(x: number): number {
    return Math.max(0, Math.min((this.project?.frameCount ?? 1) - 1, Math.round((x - LABEL_W) / FRAME_W)));
  }

  render(): void {
    if (!this.project) return;
    const w = this.canvasWidth();
    const h = this.canvasHeight();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (const c of [this.ruler, this.track]) {
      c.width = w * dpr;
      c.height = (c === this.ruler ? 28 : h) * dpr;
      c.style.width = `${w}px`;
      c.style.height = c === this.ruler ? '28px' : `${h}px`;
      const ctx = c.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    this.drawRuler();
    this.drawTracks();
    const root = this.shadowRoot!;
    (root.querySelector('#frame-max')! as HTMLElement).textContent = String(this.project.frameCount - 1);
    (root.querySelector<HTMLInputElement>('#fps')!).value = String(this.project.fps);
    (root.querySelector<HTMLInputElement>('#frame-count')!).value = String(this.project.frameCount);
    this.frameInput.textContent = String(this.currentFrame);
  }

  private drawRuler(): void {
    const ctx = this.ruler.getContext('2d')!;
    const w = this.canvasWidth();
    ctx.clearRect(0, 0, w, 28);
    ctx.fillStyle = '#171e2e';
    ctx.fillRect(0, 0, w, 28);
    ctx.strokeStyle = '#2a3550';
    ctx.fillStyle = '#64718c';
    ctx.font = '10px Consolas, monospace';
    ctx.textAlign = 'center';
    const total = this.project!.frameCount;
    const step = total > 120 ? 10 : 5;
    for (let f = 0; f < total; f++) {
      const x = this.frameToX(f);
      ctx.beginPath();
      ctx.moveTo(x, f % step === 0 ? 14 : 20);
      ctx.lineTo(x, 28);
      ctx.stroke();
      if (f % step === 0) ctx.fillText(String(f), x, 10);
    }
  }

  private drawTracks(): void {
    const ctx = this.track.getContext('2d')!;
    const w = this.canvasWidth();
    const h = this.canvasHeight();
    ctx.clearRect(0, 0, w, h);
    const bones = this.project!.skeleton;

    bones.forEach((bone, row) => {
      const y = row * ROW_H;
      ctx.fillStyle = row % 2 === 0 ? '#141b2b' : '#171e2e';
      ctx.fillRect(0, y, w, ROW_H);
      // 名称列
      ctx.fillStyle = '#93a1bd';
      ctx.font = '12px "Segoe UI", "PingFang SC", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(bone.name, 10, y + ROW_H / 2 + 4);
      ctx.strokeStyle = '#222c44';
      ctx.beginPath();
      ctx.moveTo(0, y + ROW_H);
      ctx.lineTo(w, y + ROW_H);
      ctx.stroke();

      // 跳变帧红底
      for (const f of this.jumpFrames) {
        ctx.fillStyle = 'rgba(255,93,108,.18)';
        ctx.fillRect(LABEL_W + f * FRAME_W, y, FRAME_W, ROW_H);
      }

      // 帧格竖线
      ctx.strokeStyle = 'rgba(42,53,80,.5)';
      for (let f = 0; f < this.project!.frameCount; f++) {
        const x = LABEL_W + f * FRAME_W;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + ROW_H);
        ctx.stroke();
      }

      // 插值连线
      const track = trackOf(this.project!, bone.id);
      ctx.strokeStyle = `#${(bone.color >>> 8).toString(16).padStart(6, '0')}88`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      track.forEach((k, i) => {
        const x = this.frameToX(k.frame);
        const cy = y + ROW_H / 2;
        if (i === 0) ctx.moveTo(x, cy);
        else ctx.lineTo(x, cy);
      });
      ctx.stroke();

      // 关键帧菱形
      for (const k of track) {
        this.drawDiamond(ctx, this.frameToX(k.frame), y + ROW_H / 2, k);
      }
    });

    this.drawPlayhead();
  }

  private drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, k: Keyframe): void {
    const sel = this.selectedKf.has(k.id);
    const size = sel ? 7 : 5.5;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    const easingColor: Record<string, string> = {
      linear: '#4f8cff',
      easeInOut: '#35c98f',
      bezier: '#a78bfa',
    };
    ctx.fillStyle = sel ? '#ffffff' : easingColor[k.easing];
    ctx.fill();
    ctx.strokeStyle = sel ? '#4f8cff' : 'rgba(0,0,0,.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  private drawPlayhead(): void {
    if (!this.project) return;
    const ctx = this.track.getContext('2d')!;
    const h = this.canvasHeight();
    const x = this.frameToX(this.currentFrame);
    ctx.clearRect(this.canvasWidth() - 38, 0, 38, h);
    ctx.strokeStyle = '#f5a623';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
    ctx.fillStyle = '#f5a623';
    ctx.beginPath();
    ctx.moveTo(x - 5, 0);
    ctx.lineTo(x + 5, 0);
    ctx.lineTo(x, 7);
    ctx.closePath();
    ctx.fill();
    this.frameInput.textContent = String(this.currentFrame);
  }

  private onTrackPointer(e: PointerEvent): void {
    if (!this.project) return;
    const rect = this.track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const row = Math.floor(y / ROW_H);
    const bone = this.project.skeleton[row];
    const frame = this.xToFrame(x);

    // 命中关键帧菱形
    const hit = this.project.keyframes
      .filter((k) => (!bone || k.boneId === bone.id) && Math.abs(this.frameToX(k.frame) - x) <= 8)
      .sort((a, b) => Math.abs(this.frameToX(a.frame) - x) - Math.abs(this.frameToX(b.frame) - x))[0];

    if (hit) {
      if (e.shiftKey) {
        if (this.selectedKf.has(hit.id)) this.selectedKf.delete(hit.id);
        else this.selectedKf.add(hit.id);
      } else {
        this.selectedKf = new Set([hit.id]);
      }
      this.drawTracks();
      return;
    }

    if (e.detail === 2 && bone) {
      // 双击空白：为该骨骼在当前帧打点（角度取当前视口姿态，由编辑器屏幕负责注入）
      this.dispatchEvent(new CustomEvent('request-keyframe', {
        bubbles: true,
        composed: true,
        detail: { boneId: bone.id, frame },
      }));
      return;
    }
    this.seek(frame);
  }

  private seek(frame: number): void {
    this.currentFrame = frame;
    this.drawPlayhead();
    this.events?.onFrameChange(frame);
  }

  private togglePlay(): void {
    if (this.playing) {
      this.pause();
    } else {
      this.playing = true;
      this.playBtn.textContent = '⏸ 暂停';
      this.events?.onPlayState(true);
      this.lastTickTime = performance.now();
      const tick = (now: number): void => {
        if (!this.playing || !this.project) return;
        const interval = 1000 / this.project.fps;
        if (now - this.lastTickTime >= interval) {
          this.lastTickTime = now;
          let next = this.currentFrame + 1;
          if (next >= this.project.frameCount) next = 0;
          this.seek(next);
        }
        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    }
  }

  private pause(): void {
    this.playing = false;
    this.playBtn.textContent = '▶ 播放';
    this.events?.onPlayState(false);
    cancelAnimationFrame(this.rafId);
  }

  private stop(): void {
    this.pause();
    this.seek(0);
  }

  private addAtPlayhead(): void {
    this.dispatchEvent(new CustomEvent('request-keyframe', {
      bubbles: true,
      composed: true,
      detail: { boneId: null, frame: this.currentFrame },
    }));
  }

  private deleteSelected(): void {
    if (this.selectedKf.size === 0) {
      toast('请先在轨道上点选关键帧', 'warn');
      return;
    }
    this.project!.keyframes = this.project!.keyframes.filter((k) => !this.selectedKf.has(k.id));
    this.selectedKf.clear();
    this.afterMutation();
    toast('关键帧已删除', 'warn');
  }

  private copySel(): void {
    const keys = this.project!.keyframes.filter((k) => this.selectedKf.has(k.id));
    if (keys.length === 0) {
      toast('请先选择要复制的关键帧', 'warn');
      return;
    }
    this.clipboard = copyKeyframes(keys);
    toast(`已复制 ${keys.length} 个关键帧`, 'good');
  }

  private pasteAtPlayhead(): void {
    if (this.clipboard.length === 0) {
      toast('剪贴板为空', 'warn');
      return;
    }
    const created = pasteKeyframes(this.project!, this.clipboard, this.currentFrame);
    this.selectedKf = new Set(created.map((k) => k.id));
    this.afterMutation();
    toast(`已粘贴 ${created.length} 个关键帧到第 ${this.currentFrame} 帧`, 'good');
  }

  private shift(dir: number): void {
    const input = this.shadowRoot!.querySelector<HTMLInputElement>('#shift-n')!;
    const n = Math.max(1, Number(input.value) || 1);
    const moved = shiftKeyframes(this.project!, dir * n, this.selectedKf.size ? this.selectedKf : undefined);
    if (moved === 0) toast('没有可平移的关键帧', 'warn');
    else {
      this.afterMutation();
      toast(`已整体${dir < 0 ? '左移' : '右移'} ${n} 帧`, 'good');
    }
  }

  private afterMutation(): void {
    this.refreshJumps();
    this.events?.onChange();
    this.render();
  }
}
