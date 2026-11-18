// 剖面编辑器：SVG 渲染 + 灯具/遮挡物拖拽、角度调整、网格吸附、热力图、暗区红框
import * as d3 from 'd3';
import type { Lamp, Obstacle } from '../types';
import { specOf, PERIODS, DARK_THRESHOLD } from '../constants';
import { store } from '../store';
import { luxColor, formatLux } from '../engine/color';

const H = 460; // 固定渲染高度 px

export class StageEditor extends HTMLElement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private svg!: d3.Selection<SVGSVGElement, any, any, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private layers!: Record<string, d3.Selection<SVGGElement, any, any, any>>;
  private raf = 0;

  connectedCallback() {
    this.render();
    store.subscribe(() => this.scheduleRender());
  }

  private scheduleRender() {
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(() => this.render());
  }

  private scale(): number {
    // 优先用实际渲染尺寸，保证几何坐标与屏幕像素严格一致（SVG 可能被 CSS 缩放）
    const node = this.svg?.node() as SVGSVGElement | undefined;
    const rect = node?.getBoundingClientRect();
    if (rect && rect.height > 0) return rect.height / store.get().plan.heightCm;
    return H / store.get().plan.heightCm;
  }

  private toPx(x: number, y: number): [number, number] {
    const s = this.scale();
    return [x * s, (store.get().plan.heightCm - y) * s];
  }

  private toCm(px: number, py: number): [number, number] {
    const node = this.svg.node() as SVGSVGElement;
    const rect = node.getBoundingClientRect();
    const s = rect.height / store.get().plan.heightCm;
    return [(px - rect.left) / s, store.get().plan.heightCm - (py - rect.top) / s];
  }

  private render() {
    const { plan, period, settings, selection } = store.get();
    const s = this.scale();
    const W = plan.widthCm * s;
    const field = store.currentField();
    const def = PERIODS.find(p => p.id === period)!;

    if (!this.svg) {
      const shadow = this.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = `
        :host { display: block; width: 100%; }
        svg { display: block; width: 100%; height: auto; touch-action: none; user-select: none; border-radius: 10px; }
        /* 非交互图层及其全部子元素不拦截指针（子元素默认 auto 会重新启用事件，必须显式继承） */
        [data-layer="grid"] *, [data-layer="heat"] *, [data-layer="cone"] *,
        [data-layer="zone"] *, [data-layer="hud"] *, rect.box { pointer-events: none; }
        .lamp { cursor: move; }
        .obstacle { cursor: move; }
        .handle { cursor: grab; }
        .label { font: 600 11px system-ui; pointer-events: none; }
      `;
      shadow.appendChild(style);
      const root = d3.select(shadow as unknown as HTMLElement);
      this.svg = root.append('svg').attr('height', H);
      const names = ['grid', 'heat', 'cone', 'obstacle', 'lamp', 'zone', 'hud'];
      this.layers = {} as never;
      for (const n of names) {
        this.layers[n] = this.svg.append('g').attr('data-layer', n);
      }
    }
    this.svg.attr('width', W).attr('viewBox', `0 0 ${W} ${H}`);

    // 箱体底色（时段天色）
    this.svg.selectAll('rect.box').data([null]).join('rect')
      .attr('class', 'box').attr('x', 0).attr('y', 0).attr('width', W).attr('height', H)
      .attr('fill', def.sky).attr('stroke', '#334155').attr('stroke-width', 2.5);

    this.drawGrid(W, s, settings.gridCm);
    if (settings.showHeatmap) this.drawHeat(field);
    else this.layers.heat.selectAll('*').remove();
    if (settings.showCone) this.drawCones(period);
    else this.layers.cone.selectAll('*').remove();
    this.drawObstacles();
    this.drawLamps(period, selection);
    this.drawZones(field, s);
    this.drawHud(field);
  }

  private drawGrid(W: number, s: number, gridCm: number) {
    const { plan, settings } = store.get();
    const g = this.layers.grid;
    const lines: number[] = [];
    for (let x = gridCm; x < plan.widthCm; x += gridCm) lines.push(x);
    g.selectAll<SVGLineElement, number>('line.v').data(lines).join('line')
      .attr('class', 'v').attr('x1', d => d * s).attr('x2', d => d * s).attr('y1', 0).attr('y2', H)
      .attr('stroke', settings.snap ? '#64748b' : '#cbd5e1')
      .attr('stroke-width', 0.6).attr('stroke-dasharray', '3 4').attr('opacity', 0.7);
    const hl: number[] = [];
    for (let y = gridCm; y < plan.heightCm; y += gridCm) hl.push(y);
    g.selectAll<SVGLineElement, number>('line.h').data(hl).join('line')
      .attr('class', 'h').attr('x1', 0).attr('x2', W).attr('y1', d => (plan.heightCm - d) * s).attr('y2', d => (plan.heightCm - d) * s)
      .attr('stroke', settings.snap ? '#64748b' : '#cbd5e1')
      .attr('stroke-width', 0.6).attr('stroke-dasharray', '3 4').attr('opacity', 0.7);
  }

  private drawHeat(field: ReturnType<typeof store.currentField>) {
    const { plan } = store.get();
    const s = this.scale();
    const g = this.layers.heat;
    const cells = d3.range(field.cols * field.rows).map(i => ({
      i,
      x: (i % field.cols) * field.cellW,
      y: plan.heightCm - Math.floor(i / field.cols) * field.cellH - field.cellH,
      v: field.lux[i],
      dv: field.directLux[i]
    }));
    g.selectAll<SVGRectElement, (typeof cells)[number]>('rect').data(cells, d => d.i).join('rect')
      .attr('x', d => d.x * s).attr('y', d => d.y * s)
      .attr('width', field.cellW * s + 0.5).attr('height', field.cellH * s + 0.5)
      .attr('fill', d => luxColor(d.v, field.maxLux))
      .attr('opacity', d => (d.dv - d.v > d.dv * 0.15 ? 0.42 : 0.58)); // 阴影损失区略透，显现软阴影
  }

  private drawCones(period: string) {
    const { plan } = store.get();
    const g = this.layers.cone;
    const reach = plan.heightCm + plan.widthCm;
    g.selectAll<SVGPolygonElement, Lamp>('polygon').data(plan.lamps, l => l.id).join('polygon')
      .attr('points', l => {
        const spec = specOf(l.kind);
        const half = (spec.halfAngleDeg * Math.PI) / 180;
        const th = (l.angle * Math.PI) / 180;
        const [lx, ly] = this.toPx(l.x, l.y);
        const [x1, y1] = this.toPx(l.x + Math.cos(th - half) * reach, l.y + Math.sin(th - half) * reach);
        const [x2, y2] = this.toPx(l.x + Math.cos(th + half) * reach, l.y + Math.sin(th + half) * reach);
        return `${lx},${ly} ${x1},${y1} ${x2},${y2}`;
      })
      .attr('fill', l => specOf(l.kind).color)
      .attr('opacity', l => (l.schedule[period as keyof Lamp['schedule']] ? 0.11 : 0.04));
  }

  private drawObstacles() {
    const { plan, selection } = store.get();
    const s = this.scale();
    const g = this.layers.obstacle;
    const sel = (o: Obstacle) => selection?.type === 'obstacle' && selection.id === o.id;
    g.selectAll<SVGRectElement, Obstacle>('rect.body').data(plan.obstacles, o => o.id).join('rect')
      .attr('class', 'body obstacle')
      .attr('x', o => (o.x - o.w / 2) * s).attr('y', o => (plan.heightCm - o.y - o.h / 2) * s)
      .attr('width', o => o.w * s).attr('height', o => o.h * s)
      .attr('rx', o => (o.kind === 'hide' ? 7 : 3))
      .attr('fill', o => (o.kind === 'hide' ? '#78716c' : o.kind === 'branch' ? '#92400e' : '#38bdf8'))
      .attr('stroke', o => (sel(o) ? '#fde047' : '#1f2937')).attr('stroke-width', o => (sel(o) ? 3 : 1.2))
      .attr('opacity', 0.93)
      .on('pointerdown', (event: PointerEvent, o) => this.startDrag(event, 'obstacle', o.id));

    g.selectAll<SVGTextElement, Obstacle>('text').data(plan.obstacles, o => o.id).join('text')
      .attr('class', 'label').attr('text-anchor', 'middle')
      .attr('x', o => o.x * s).attr('y', o => (plan.heightCm - o.y) * s + 4)
      .attr('fill', '#fff').attr('font-size', 11)
      .text(o => o.name);
  }

  private drawLamps(period: string, selection: ReturnType<typeof store.get>['selection']) {
    const { plan } = store.get();
    const s = this.scale();
    const g = this.layers.lamp;
    const on = (l: Lamp) => l.schedule[period as keyof Lamp['schedule']];
    const sel = (l: Lamp) => selection?.type === 'lamp' && selection.id === l.id;

    // 线性灯管用 line，点光源用 circle
    g.selectAll<SVGGElement, Lamp>('g.lamp').data(plan.lamps, l => l.id).join(
      enter => {
        const gg = enter.append('g').attr('class', 'lamp');
        gg.append('line').attr('class', 'tube');
        gg.append('circle').attr('class', 'bulb');
        gg.append('circle').attr('class', 'handle').attr('r', 5).attr('fill', '#fde047').attr('stroke', '#111').attr('stroke-width', 1);
        gg.append('text').attr('class', 'label').attr('text-anchor', 'middle');
        return gg;
      },
      update => update,
      exit => exit.remove()
    ).each(function (l) {
      const node = d3.select(this);
      const spec = specOf(l.kind);
      const th = (l.angle * Math.PI) / 180;
      const px = l.x * s;
      const py = (plan.heightCm - l.y) * s;
      const active = on(l);
      node.select('.tube')
        .attr('x1', px - Math.sin(th) * (spec.length * s) / 2).attr('y1', py - Math.cos(th) * (spec.length * s) / 2)
        .attr('x2', px + Math.sin(th) * (spec.length * s) / 2).attr('y2', py + Math.cos(th) * (spec.length * s) / 2)
        .attr('stroke', spec.color).attr('stroke-width', 8).attr('stroke-linecap', 'round')
        .attr('opacity', spec.length > 0 ? (active ? 1 : 0.22) : 0);
      node.select('.bulb')
        .attr('cx', px).attr('cy', py).attr('r', spec.length > 0 ? 3 : 8)
        .attr('fill', spec.color).attr('stroke', '#111827').attr('stroke-width', 1.4)
        .attr('opacity', active ? 1 : 0.22);
      // 角度手柄：沿光轴方向 22px（屏幕 y 向下，物理 y 向上，故取 -sin）
      const hx = px + Math.cos(th) * 24;
      const hy = py - Math.sin(th) * 24;
      node.select('.handle')
        .attr('cx', hx).attr('cy', hy).attr('opacity', sel(l) ? 1 : 0);
      node.select('.label')
        .attr('x', px).attr('y', py - 14)
        .attr('fill', '#0f172a').attr('font-weight', 700)
        .text(`${l.name}${active ? '' : '（关）'}`);
    })
      .on('pointerdown', (event: PointerEvent, l) => {
        if ((event.target as Element).classList.contains('handle')) {
          this.startRotate(event, l.id);
        } else {
          this.startDrag(event, 'lamp', l.id);
        }
      });
  }

  private drawZones(field: ReturnType<typeof store.currentField>, s: number) {
    const { plan } = store.get();
    const g = this.layers.zone;
    g.selectAll<SVGRectElement, typeof field.zones[number]>('rect.dark').data(field.zones, z => z.index).join('rect')
      .attr('class', 'dark')
      .attr('x', z => z.x0 * s + 2).attr('y', 2)
      .attr('width', z => (z.x1 - z.x0) * s - 4).attr('height', plan.heightCm * s - 4)
      .attr('fill', 'none')
      .attr('stroke', z => (z.dark ? '#ef4444' : 'transparent'))
      .attr('stroke-width', 3.5).attr('stroke-dasharray', '9 6');

    g.selectAll<SVGTextElement, typeof field.zones[number]>('text.zone').data(field.zones, z => z.index).join('text')
      .attr('class', 'zone').attr('text-anchor', 'middle')
      .attr('x', z => ((z.x0 + z.x1) / 2) * s).attr('y', plan.heightCm * s - 8)
      .attr('font-size', 11).attr('font-weight', 700)
      .attr('fill', z => (z.dark ? '#b91c1c' : '#334155'))
      .attr('paint-order', 'stroke').attr('stroke', 'rgba(255,255,255,0.75)').attr('stroke-width', 3)
      .text(z => `${z.name} ${formatLux(z.avgLux)}lx`);
  }

  private drawHud(field: ReturnType<typeof store.currentField>) {
    const g = this.layers.hud;
    g.selectAll('text.hud').data([null]).join('text')
      .attr('class', 'hud').attr('x', 8).attr('y', 18)
      .attr('font-size', 11).attr('fill', '#334155')
      .attr('paint-order', 'stroke').attr('stroke', 'rgba(255,255,255,0.8)').attr('stroke-width', 3)
      .text(`峰值 ${formatLux(field.maxLux)} lux ｜ 暗区阈值 ${DARK_THRESHOLD} lux ｜ 红虚线框 = 暗区`);
  }

  // ---- 指针交互 ----
  private startDrag(event: PointerEvent, type: 'lamp' | 'obstacle', id: string) {
    event.preventDefault();
    event.stopPropagation();
    store.select(type, id);
    store.beginDrag();
    const move = (ev: PointerEvent) => {
      const [cx, cy] = this.toCm(ev.clientX, ev.clientY);
      const { plan } = store.get();
      const x = Math.min(Math.max(cx, 1), plan.widthCm - 1);
      const y = Math.min(Math.max(cy, 1), plan.heightCm - 1);
      if (type === 'lamp') store.moveLamp(id, x, y, false);
      else store.moveObstacle(id, x, y, false);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  private startRotate(event: PointerEvent, lampId: string) {
    event.preventDefault();
    event.stopPropagation();
    store.beginDrag();
    const lamp = store.get().plan.lamps.find(l => l.id === lampId)!;
    const move = (ev: PointerEvent) => {
      // 屏幕坐标 y 向下：屏幕系 atan2（向下为 +90°）映射回物理系（向下为 -90°）
      const s = this.scale();
      const rect = (this.svg.node() as SVGSVGElement).getBoundingClientRect();
      const lx = rect.left + lamp.x * s;
      const ly = rect.top + (store.get().plan.heightCm - lamp.y) * s;
      const screenAngle = (Math.atan2(ev.clientY - ly, ev.clientX - lx) * 180) / Math.PI;
      store.rotateLamp(lampId, -screenAngle, false);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }
}

customElements.define('stage-editor', StageEditor);
