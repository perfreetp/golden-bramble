// 属性检查器：选中灯具/遮挡物的参数编辑 + 时段开关矩阵
import { PERIODS, specOf } from '../constants';
import { store } from '../store';
import type { Lamp, Obstacle, PeriodId } from '../types';

export class Inspector extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host { display:block; }
        h3 { margin:0 0 10px; font-size:13px; color:#475569; }
        .panel { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:12px; }
        .row { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:9px; }
        label { font-size:12px; color:#475569; flex:none; }
        input[type=number], input[type=text] {
          width: 88px; padding:5px 7px; border:1px solid #cbd5e1; border-radius:7px; font:inherit; font-size:12px;
        }
        input[type=range] { flex:1; }
        .pow { font-size:12px; color:#0f172a; width:38px; text-align:right; }
        table { width:100%; border-collapse:collapse; margin-top:6px; }
        th, td { font-size:11px; text-align:center; padding:5px 2px; color:#64748b; }
        .sw { width:34px; height:22px; }
        .del { width:100%; margin-top:8px; padding:8px; border:none; border-radius:8px; background:#fee2e2; color:#b91c1c;
          font-weight:700; cursor:pointer; font:inherit; font-size:12px; }
        .del:hover { background:#fecaca; }
        .empty { font-size:12px; color:#94a3b8; text-align:center; padding:18px 6px; line-height:1.6; }
        .tag { display:inline-block; padding:2px 8px; border-radius:99px; font-size:11px; font-weight:700; color:#fff; margin-bottom:8px; }
      </style>
      <h3>属性检查器</h3>
      <div id="body"><div class="panel empty">点击剖面中的灯具或遮挡物<br/>查看与编辑参数</div></div>
    `;
    store.subscribe(() => this.render());
    this.render = this.render.bind(this);
  }

  private render() {
    const body = this.shadowRoot!.getElementById('body')!;
    const { selection, plan } = store.get();
    if (!selection) {
      body.innerHTML = `<div class="panel empty">点击剖面中的灯具或遮挡物<br/>查看与编辑参数</div>`;
      return;
    }
    if (selection.type === 'lamp') {
      const lamp = plan.lamps.find(l => l.id === selection.id);
      if (lamp) { body.innerHTML = this.lampPanel(lamp); this.bindLamp(lamp); }
    } else {
      const obs = plan.obstacles.find(o => o.id === selection.id);
      if (obs) { body.innerHTML = this.obsPanel(obs); this.bindObs(obs); }
    }
  }

  private lampPanel(l: Lamp): string {
    const spec = specOf(l.kind);
    return `
      <div class="panel">
        <span class="tag" style="background:${spec.color};color:#111">${l.name}</span>
        <div class="row"><label>X (cm)</label><input type="number" data-k="x" value="${l.x.toFixed(1)}" step="1" min="0" max="${store.get().plan.widthCm}"></div>
        <div class="row"><label>高度 Y (cm)</label><input type="number" data-k="y" value="${l.y.toFixed(1)}" step="1" min="0" max="${store.get().plan.heightCm}"></div>
        <div class="row"><label>照射角度</label><input type="number" data-k="angle" value="${l.angle}" step="${store.get().settings.angleSnapDeg}" min="-180" max="180"></div>
        <div class="row"><label>功率倍率</label><input type="range" data-k="power" min="0.1" max="1.5" step="0.05" value="${l.power}"><span class="pow">${(l.power * 100).toFixed(0)}%</span></div>
        <table>
          <thead><tr>${PERIODS.map(p => `<th>${p.label}</th>`).join('')}</tr></thead>
          <tbody><tr>${PERIODS.map(p => `<td><input class="sw" type="checkbox" data-period="${p.id}" ${l.schedule[p.id] ? 'checked' : ''}></td>`).join('')}</tr></tbody>
        </table>
        <div style="font-size:11px;color:#94a3b8;margin-top:6px">角度 -90° 为垂直向下，当前偏离 ${Math.abs(l.angle + 90).toFixed(0)}°</div>
        <button class="del" data-del>删除灯具</button>
      </div>`;
  }

  private bindLamp(l: Lamp) {
    const root = this.shadowRoot!;
    root.querySelectorAll<HTMLInputElement>('input[data-k]').forEach(inp => {
      inp.addEventListener('change', () => {
        const k = inp.dataset.k as keyof Lamp;
        const v = parseFloat(inp.value);
        if (Number.isFinite(v)) store.updateLamp(l.id, { [k]: v } as Partial<Lamp>);
      });
    });
    root.querySelectorAll<HTMLInputElement>('input[data-period]').forEach(inp => {
      inp.addEventListener('change', () => store.toggleSchedule(l.id, inp.dataset.period as PeriodId));
    });
    root.querySelector('[data-del]')?.addEventListener('click', () => store.removeLamp(l.id));
  }

  private obsPanel(o: Obstacle): string {
    return `
      <div class="panel">
        <span class="tag" style="background:#475569">${o.name}</span>
        <div class="row"><label>X (cm)</label><input type="number" data-k="x" value="${o.x.toFixed(1)}" step="1"></div>
        <div class="row"><label>Y (cm)</label><input type="number" data-k="y" value="${o.y.toFixed(1)}" step="1"></div>
        <div class="row"><label>宽 (cm)</label><input type="number" data-k="w" value="${o.w}" step="1" min="2"></div>
        <div class="row"><label>高 (cm)</label><input type="number" data-k="h" value="${o.h}" step="1" min="2"></div>
        <div class="row"><label>名称</label><input type="text" data-k="name" value="${o.name}"></div>
        <button class="del" data-del>删除遮挡物</button>
      </div>`;
  }

  private bindObs(o: Obstacle) {
    const root = this.shadowRoot!;
    root.querySelectorAll<HTMLInputElement>('input[data-k]').forEach(inp => {
      inp.addEventListener('change', () => {
        const k = inp.dataset.k as keyof Obstacle;
        if (k === 'name') store.updateObstacle(o.id, { name: inp.value });
        else {
          const v = parseFloat(inp.value);
          if (Number.isFinite(v)) store.updateObstacle(o.id, { [k]: v } as Partial<Obstacle>);
        }
      });
    });
    root.querySelector('[data-del]')?.addEventListener('click', () => store.removeObstacle(o.id));
  }
}

customElements.define('prop-inspector', Inspector);
