/** PixiJS 画布：整幅编织渲染、滚轮缩放、拖拽平移、拼缝/锁定/手工标记叠加层 */

import { Application, Container, Graphics, Text } from 'pixi.js';
import { HOLE, TOP_WARP, PatternParams, WeaveGrid } from '../core/types';
import { manualFlags } from '../core/pattern';
import { TilePlan, seamLines } from '../core/tiling';
import { Store, store } from '../state/store';

const PX_PER_MM = 1.2; // 1 倍缩放下的像素密度
const MIN_ZOOM = 0.15;
const MAX_ZOOM = 60;

function hexToNum(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

/** 明暗系数作用于颜色 */
function shade(num: number, f: number): number {
  const r = Math.min(255, Math.round(((num >> 16) & 0xff) * f));
  const g = Math.min(255, Math.round(((num >> 8) & 0xff) * f));
  const b = Math.min(255, Math.round((num & 0xff) * f));
  return (r << 16) | (g << 8) | b;
}

export interface RenderInput {
  params: PatternParams;
  grid: WeaveGrid;
  plan: TilePlan | null;
}

export class WeaveRenderer {
  private app = new Application();
  private world = new Container();
  private weaveG = new Graphics();
  private overlayG = new Graphics();
  private labels = new Container();
  private zoom = 1;
  private ready = false;
  canvas!: HTMLCanvasElement;

  async init(parent: HTMLElement): Promise<void> {
    await this.app.init({
      background: 0x26221c,
      resizeTo: parent,
      antialias: true,
      resolution: Math.min(2, window.devicePixelRatio || 1),
      autoDensity: true,
    });
    this.canvas = this.app.canvas as HTMLCanvasElement;
    parent.appendChild(this.canvas);
    this.world.addChild(this.weaveG);
    this.world.addChild(this.overlayG);
    this.world.addChild(this.labels);
    this.app.stage.addChild(this.world);
    this.ready = true;
    this.fitView(store.state.params);
  }

  getZoom(): number {
    return this.zoom;
  }

  private applyTransform(): void {
    this.world.scale.set(this.zoom * PX_PER_MM);
  }

  fitView(params: PatternParams): void {
    if (!this.ready) return;
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    const zx = w / (params.widthMm * PX_PER_MM);
    const zy = h / (params.heightMm * PX_PER_MM);
    this.zoom = Math.max(MIN_ZOOM, Math.min(zx, zy) * 0.92);
    this.applyTransform();
    this.world.position.set(
      (w - params.widthMm * PX_PER_MM * this.zoom) / 2,
      (h - params.heightMm * PX_PER_MM * this.zoom) / 2,
    );
  }

  /** 滚轮缩放：以指针为中心，放大后能看清单根带材压叠 */
  zoomAt(px: number, py: number, factor: number): void {
    const old = this.zoom;
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, old * factor));
    if (next === old) return;
    const s = next / old;
    this.world.position.set(px - (px - this.world.x) * s, py - (py - this.world.y) * s);
    this.zoom = next;
    this.applyTransform();
  }

  panBy(dx: number, dy: number): void {
    this.world.position.set(this.world.x + dx, this.world.y + dy);
  }

  /** 屏幕坐标 → 单元坐标 */
  toCell(px: number, py: number, grid: WeaveGrid): { i: number; j: number } | null {
    const wx = (px - this.world.x) / this.world.scale.x;
    const wy = (py - this.world.y) / this.world.scale.y;
    const i = Math.floor(wx / grid.pitchX);
    const j = Math.floor(wy / grid.pitchY);
    if (i < 0 || j < 0 || i >= grid.warpCount || j >= grid.weftCount) return null;
    return { i, j };
  }

  /** 屏幕坐标 → 距离最近的带材（用于改色） */
  toStrip(px: number, py: number, grid: WeaveGrid): { dir: 'warp' | 'weft'; idx: number } | null {
    const wx = (px - this.world.x) / this.world.scale.x;
    const wy = (py - this.world.y) / this.world.scale.y;
    const i = Math.floor(wx / grid.pitchX);
    const j = Math.floor(wy / grid.pitchY);
    if (i < 0 || j < 0 || i >= grid.warpCount || j >= grid.weftCount) return null;
    const dx = Math.abs(wx - (i + 0.5) * grid.pitchX) / grid.pitchX;
    const dy = Math.abs(wy - (j + 0.5) * grid.pitchY) / grid.pitchY;
    return dx > dy ? { dir: 'warp', idx: i } : { dir: 'weft', idx: j };
  }

  /** 全量重绘（生成/参数变化时调用；交互缩放平移不重绘） */
  render(input: RenderInput, s: Store['state']): void {
    if (!this.ready) return;
    const { params, grid } = input;
    const g = this.weaveG;
    g.clear();
    this.overlayG.clear();
    this.labels.removeChildren();

    const wStrip = Math.min(params.stripWidth, grid.pitchX, grid.pitchY);
    const offX = (grid.pitchX - wStrip) / 2;
    const offY = (grid.pitchY - wStrip) / 2;
    const bandColors = params.bands.map((b) => hexToNum(b.color));

    // 逐单元：先画被压的一段，再画压在上面的一段，明暗区分压叠
    for (let j = 0; j < grid.weftCount; j++) {
      const y = j * grid.pitchY;
      const weftColor = shade(bandColors[grid.weftBand[j]] ?? 0x999999, grid.weftShade[j]);
      for (let i = 0; i < grid.warpCount; i++) {
        const t = grid.top[j * grid.warpCount + i];
        if (t === HOLE) continue; // 六角网孔洞：露出底色
        const x = i * grid.pitchX;
        const warpColor = shade(bandColors[grid.warpBand[i]] ?? 0x999999, grid.warpShade[i]);
        const warpOnTop = t === TOP_WARP;
        const underC = warpOnTop ? shade(weftColor, 0.66) : shade(warpColor, 0.66);
        const overC = warpOnTop ? warpColor : weftColor;
        // 被压段
        if (warpOnTop) g.rect(x, y + offY, grid.pitchX, wStrip);
        else g.rect(x + offX, y, wStrip, grid.pitchY);
        g.fill(underC);
        // 压在上面的段
        if (warpOnTop) g.rect(x + offX, y, wStrip, grid.pitchY);
        else g.rect(x, y + offY, grid.pitchX, wStrip);
        g.fill(overC);
        // 高光棱线（圆藤受光面，任何缩放级别都画出，放大后清晰可辨）
        if (warpOnTop) g.rect(x + offX + wStrip * 0.18, y, wStrip * 0.16, grid.pitchY);
        else g.rect(x, y + offY + wStrip * 0.18, grid.pitchX, wStrip * 0.16);
        g.fill(shade(overC, 1.25));
      }
    }

    this.drawOverlay(input, s);
  }

  private drawOverlay(input: RenderInput, s: Store['state']): void {
    const { grid, params, plan } = input;
    const o = this.overlayG;
    const W = params.widthMm;
    const H = params.heightMm;

    // 外框
    o.rect(0, 0, W, H).stroke({ width: 1.5 / this.zoom, color: 0x8a7f66, alpha: 0.9 });

    // 拼缝线与拼片编号
    if (plan && s.showSeams) {
      const seams = seamLines(plan);
      for (const x of seams.vertical) {
        o.moveTo(x, 0).lineTo(x, H).stroke({ width: 1.2 / this.zoom, color: 0x35c4dc, alpha: 0.95 });
      }
      for (const y of seams.horizontal) {
        o.moveTo(0, y).lineTo(W, y).stroke({ width: 1.2 / this.zoom, color: 0x35c4dc, alpha: 0.95 });
      }
      for (const t of plan.tiles) {
        const label = new Text({
          text: `#${t.index}`,
          style: { fill: 0x35c4dc, fontSize: 14 / this.zoom, fontWeight: 'bold' },
        });
        label.position.set(t.x + 4 / this.zoom, t.y + 3 / this.zoom);
        this.labels.addChild(label);
      }
    }

    // 锁定区域
    for (const r of s.locks) {
      const x = r.i0 * grid.pitchX;
      const y = r.j0 * grid.pitchY;
      const w = (r.i1 - r.i0 + 1) * grid.pitchX;
      const h = (r.j1 - r.j0 + 1) * grid.pitchY;
      o.rect(x, y, w, h).fill({ color: 0xf2c14e, alpha: 0.12 });
      o.rect(x, y, w, h).stroke({ width: 1.4 / this.zoom, color: 0xf2c14e });
    }

    // 手工项标记：翻转单元画点，改色带材端头画三角
    if (s.showManualMarks) {
      const flags = manualFlags(grid, s.manual);
      const dotR = Math.min(grid.pitchX, grid.pitchY) * 0.18;
      for (let j = 0; j < grid.weftCount; j++) {
        for (let i = 0; i < grid.warpCount; i++) {
          if (flags.cell[j * grid.warpCount + i]) {
            o.circle((i + 0.5) * grid.pitchX, (j + 0.5) * grid.pitchY, dotR).fill(0xff4fa3);
          }
        }
      }
      const tri = Math.min(grid.pitchX, grid.pitchY) * 0.5;
      for (let i = 0; i < grid.warpCount; i++) {
        if (flags.warp[i]) {
          const x = (i + 0.5) * grid.pitchX;
          o.poly([x, 0, x - tri / 2, -tri * 0.8, x + tri / 2, -tri * 0.8]).fill(0xff4fa3);
        }
      }
      for (let j = 0; j < grid.weftCount; j++) {
        if (flags.weft[j]) {
          const y = (j + 0.5) * grid.pitchY;
          o.poly([0, y, -tri * 0.8, y - tri / 2, -tri * 0.8, y + tri / 2]).fill(0xff4fa3);
        }
      }
    }
  }

  /** 只刷新叠加层（缩放时线宽跟随） */
  refreshOverlay(input: RenderInput, s: Store['state']): void {
    if (!this.ready) return;
    this.overlayG.clear();
    this.labels.removeChildren();
    this.drawOverlay(input, s);
  }

  /** 导出整幅预览 PNG */
  async exportPng(): Promise<Blob | null> {
    if (!this.ready) return null;
    const canvas = this.app.renderer.extract.canvas(this.world) as HTMLCanvasElement;
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
  }
}
