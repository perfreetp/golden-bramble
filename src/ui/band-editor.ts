/** 色带组编辑：换色、调占比（宽窄），改动实时反映到画布 */

import { ColorBand } from '../core/types';
import { store } from '../state/store';
import { PANEL_CSS } from './common';

export class BandEditor extends HTMLElement {
  private unsub?: () => void;

  connectedCallback(): void {
    this.attachShadow({ mode: 'open' });
    this.unsub = store.subscribe(() => this.render());
    this.render();
  }

  disconnectedCallback(): void {
    this.unsub?.();
  }

  private render(): void {
    const s = store.state;
    const shadow = this.shadowRoot!;
    // 正在拖动取色器/滑杆时跳过整体重绘，避免输入控件被替换（画布预览仍实时更新）
    const active = shadow.activeElement as HTMLInputElement | null;
    if (active && active.tagName === 'INPUT' && (active.type === 'color' || active.type === 'range')) {
      return;
    }
    const total = s.params.bands.reduce((sum, b) => sum + Math.max(0, b.ratio), 0) || 1;

    shadow.innerHTML = `
      <style>${PANEL_CSS}
        .band { display: grid; grid-template-columns: 18px 1fr 34px 46px 60px 26px; gap: 6px;
          align-items: center; padding: 4px; border-radius: 4px; margin-bottom: 3px; }
        .band.active { outline: 2px solid #d8c98f; }
        .band input[type=range] { width: 100%; max-width: none; }
        .pct { color: #a9a294; font-size: 11px; text-align: right; }
      </style>
      <h3>色带组（占比决定宽窄，改色实时预览）</h3>
      <div id="bands"></div>
      <div class="row">
        <button id="add">+ 加色带</button>
        <span class="hint">改色模式下点击画布带材，即刷上选中的色带</span>
      </div>
    `;

    const box = shadow.querySelector('#bands') as HTMLDivElement;
    s.params.bands.forEach((band, idx) => {
      const row = document.createElement('div');
      row.className = 'band' + (idx === s.activeBand ? ' active' : '');

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'activeBand';
      radio.checked = idx === s.activeBand;
      radio.title = '设为当前色带';
      radio.addEventListener('change', () => store.set({ activeBand: idx }));

      const name = document.createElement('input');
      name.value = band.name;
      name.addEventListener('change', () => this.updateBand(idx, { name: name.value }));

      const color = document.createElement('input');
      color.type = 'color';
      color.value = band.color;
      color.addEventListener('input', () => this.updateBand(idx, { color: color.value }));

      const ratio = document.createElement('input');
      ratio.type = 'range';
      ratio.min = '0.5';
      ratio.max = '10';
      ratio.step = '0.5';
      ratio.value = String(band.ratio);
      ratio.title = `占比 ${band.ratio}`;
      ratio.addEventListener('input', () => this.updateBand(idx, { ratio: Number(ratio.value) }));

      const pct = document.createElement('span');
      pct.className = 'pct';
      pct.textContent = `${Math.round((Math.max(0, band.ratio) / total) * 100)}%`;

      const del = document.createElement('button');
      del.textContent = '×';
      del.className = 'danger';
      del.disabled = s.params.bands.length <= 1;
      del.addEventListener('click', () => {
        const bands = s.params.bands.filter((_, k) => k !== idx);
        store.setParams({ bands });
        if (s.activeBand >= bands.length) store.set({ activeBand: 0 });
      });

      row.append(radio, name, color, ratio, pct, del);
      box.append(row);
    });

    (shadow.querySelector('#add') as HTMLButtonElement).addEventListener('click', () => {
      const n = s.params.bands.length + 1;
      const band: ColorBand = {
        id: `b${Date.now().toString(36)}`,
        name: `色带${n}`,
        color: '#7a8a5a',
        ratio: 1,
      };
      store.setParams({ bands: [...s.params.bands, band] });
    });
  }

  private updateBand(idx: number, patch: Partial<ColorBand>): void {
    const bands = store.state.params.bands.map((b, k) => (k === idx ? { ...b, ...patch } : b));
    store.setParams({ bands });
  }
}

customElements.define('band-editor', BandEditor);
