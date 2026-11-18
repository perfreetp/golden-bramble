// 照度色阶图例（D3 插值）
import { store } from '../store';
import { luxColor, legendTicks, formatLux } from '../engine/color';

export class HeatLegend extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host { display:flex; align-items:center; gap:10px; font-size:11px; color:#64748b; }
        .bar { width:220px; height:12px; border-radius:6px; border:1px solid #cbd5e1; }
        .ticks { display:flex; justify-content:space-between; width:220px; margin-top:2px; }
      </style>
      <div>
        <div class="bar" id="bar"></div>
        <div class="ticks" id="ticks"></div>
      </div>
      <div>照度 (lux)</div>
    `;
    store.subscribe(() => this.render());
    this.render();
  }

  private render() {
    const max = store.currentField().maxLux;
    const bar = this.shadowRoot!.getElementById('bar')!;
    const segs = 48;
    bar.style.background = `linear-gradient(to right, ${Array.from({ length: segs }, (_, i) =>
      `${luxColor((i / (segs - 1)) * max, max)} ${(i / (segs - 1)) * 100}%`).join(',')})`;
    this.shadowRoot!.getElementById('ticks')!.innerHTML =
      legendTicks(max).map(v => `<span>${formatLux(v)}</span>`).join('');
  }
}

customElements.define('heat-legend', HeatLegend);
