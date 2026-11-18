/** 画布视图：承载 PixiJS，处理缩放/平移/编辑/锁定交互 */

import { HOLE, TOP_WARP, TOP_WEFT } from '../core/types';
import { computeTilePlan } from '../core/tiling';
import { WeaveRenderer, RenderInput } from '../render/WeaveRenderer';
import { store } from '../state/store';
import { PANEL_CSS } from './common';

export function currentRenderInput(): RenderInput {
  const s = store.state;
  const plan = computeTilePlan(s.grid, s.params.bands, s.params.widthMm, s.params.heightMm, s.tileSizeMm);
  return { params: s.params, grid: s.grid, plan };
}

/** 全局唯一画布实例，供导出等功能取用 */
export let canvasView: CanvasView | null = null;

export class CanvasView extends HTMLElement {
  private renderer = new WeaveRenderer();
  private container!: HTMLDivElement;
  private zoomLabel!: HTMLSpanElement;
  private unsub?: () => void;
  private rafPending = false;

  // 交互状态
  private dragging = false;
  private dragButton = 0;
  private lastX = 0;
  private lastY = 0;
  private moved = 0;
  private lockStart: { i: number; j: number } | null = null;

  connectedCallback(): void {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        ${PANEL_CSS}
        :host { display: block; position: relative; width: 100%; height: 100%; overflow: hidden; }
        .host { position: absolute; inset: 0; }
        .hud { position: absolute; left: 10px; bottom: 8px; color: #a9a294; font-size: 11px;
          background: rgba(30,33,38,.75); padding: 3px 8px; border-radius: 4px; pointer-events: none; }
      </style>
      <div class="host"></div>
      <div class="hud">滚轮缩放 · 拖拽平移 · 缩放 <span id="zoom">100%</span></div>
    `;
    this.container = shadow.querySelector('.host') as HTMLDivElement;
    this.zoomLabel = shadow.querySelector('#zoom') as HTMLSpanElement;

    void this.renderer.init(this.container).then(() => {
      this.scheduleRender();
      this.wireEvents();
    });

    this.unsub = store.subscribe(() => this.scheduleRender());
    window.addEventListener('weave:fit', this.onFit);
    canvasView = this;
  }

  private onFit = (): void => {
    this.renderer.fitView(store.state.params);
  };

  disconnectedCallback(): void {
    this.unsub?.();
    window.removeEventListener('weave:fit', this.onFit);
    if (canvasView === this) canvasView = null;
  }

  /** 合并到下一帧重绘，避免拖动色带滑杆时卡顿 */
  private scheduleRender(): void {
    if (this.rafPending) return;
    this.rafPending = true;
    requestAnimationFrame(() => {
      this.rafPending = false;
      this.renderer.render(currentRenderInput(), store.state);
      this.updateHud();
    });
  }

  private updateHud(): void {
    this.zoomLabel.textContent = `${Math.round(this.renderer.getZoom() * 100)}%`;
  }

  private wireEvents(): void {
    const canvas = this.renderer.canvas;
    canvas.style.display = 'block';

    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
        this.renderer.zoomAt(e.clientX - rect.left, e.clientY - rect.top, factor);
        this.renderer.refreshOverlay(currentRenderInput(), store.state);
        this.updateHud();
      },
      { passive: false },
    );

    canvas.addEventListener('pointerdown', (e) => {
      canvas.setPointerCapture(e.pointerId);
      this.dragging = true;
      this.dragButton = e.button;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.moved = 0;
      if (store.state.mode === 'lock') {
        const rect = canvas.getBoundingClientRect();
        this.lockStart = this.renderer.toCell(e.clientX - rect.left, e.clientY - rect.top, store.state.grid);
      }
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.moved += Math.abs(dx) + Math.abs(dy);
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      if (store.state.mode === 'pan' || this.dragButton === 1) {
        this.renderer.panBy(dx, dy);
      }
    });

    canvas.addEventListener('pointerup', (e) => {
      if (!this.dragging) return;
      this.dragging = false;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const s = store.state;

      if (s.mode === 'lock' && this.lockStart) {
        const end = this.renderer.toCell(px, py, s.grid);
        if (end) {
          store.addLock({
            i0: Math.min(this.lockStart.i, end.i),
            j0: Math.min(this.lockStart.j, end.j),
            i1: Math.max(this.lockStart.i, end.i),
            j1: Math.max(this.lockStart.j, end.j),
          });
        }
        this.lockStart = null;
        return;
      }
      if (this.moved > 6) return; // 拖拽不算点击

      if (s.mode === 'flip') {
        const cell = this.renderer.toCell(px, py, s.grid);
        if (cell) {
          const cur = s.grid.top[cell.j * s.grid.warpCount + cell.i];
          if (cur !== HOLE) {
            store.addManual({
              kind: 'flip',
              i: cell.i,
              j: cell.j,
              value: cur === TOP_WARP ? TOP_WEFT : TOP_WARP,
            });
          }
        }
      } else if (s.mode === 'color') {
        const strip = this.renderer.toStrip(px, py, s.grid);
        if (strip) {
          store.addManual({
            kind: strip.dir === 'warp' ? 'warpColor' : 'weftColor',
            i: strip.idx,
            j: -1,
            value: s.activeBand,
          });
        }
      }
    });
  }

  fitView(): void {
    this.renderer.fitView(store.state.params);
  }

  async exportPng(): Promise<Blob | null> {
    return this.renderer.exportPng();
  }
}

customElements.define('canvas-view', CanvasView);
