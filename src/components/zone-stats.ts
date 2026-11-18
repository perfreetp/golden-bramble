// 区域照度统计：左/中/右三区平均照度、地面照度，暗区红标
import { store } from '../store';
import { DARK_THRESHOLD } from '../constants';
import { formatLux } from '../engine/color';

export class ZoneStatsPanel extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        h3 { margin:0 0 10px; font-size:13px; color:#475569; }
        .grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; }
        .card { background:#fff; border:2px solid #e2e8f0; border-radius:10px; padding:10px 8px; text-align:center; }
        .card.dark { border-color:#ef4444; background:#fef2f2; }
        .name { font-size:12px; font-weight:700; color:#334155; }
        .lux { font-size:20px; font-weight:800; margin:4px 0; color:#0f172a; font-variant-numeric:tabular-nums; }
        .card.dark .lux { color:#dc2626; }
        .sub { font-size:10px; color:#64748b; line-height:1.5; }
        .badge { display:inline-block; margin-top:4px; font-size:10px; font-weight:700; padding:2px 7px; border-radius:99px;
          background:#dc2626; color:#fff; }
        .ok { background:#16a34a; }
      </style>
      <h3>区域照度统计（平均 / 地面 5cm）</h3>
      <div class="grid" id="grid"></div>
    `;
    store.subscribe(() => this.render());
    this.render();
  }

  private render() {
    const field = store.currentField();
    const grid = this.shadowRoot!.getElementById('grid')!;
    grid.innerHTML = field.zones.map(z => `
      <div class="card ${z.dark ? 'dark' : ''}">
        <div class="name">${z.name}（${z.lampCount} 盏灯）</div>
        <div class="lux">${formatLux(z.avgLux)}</div>
        <div class="sub">lux 平均<br/>地面 ${formatLux(z.floorLux)} lux</div>
        ${z.dark ? `<div class="badge">暗区 &lt; ${DARK_THRESHOLD} lux</div>` : `<div class="badge ok">达标</div>`}
      </div>
    `).join('');
  }
}

customElements.define('zone-stats', ZoneStatsPanel);
