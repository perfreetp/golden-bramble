// 时段时间轴：早晨 / 正午 / 傍晚 / 夜间
import { PERIODS } from '../constants';
import { store } from '../store';
import type { PeriodId } from '../types';

export class Timeline extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host { display: block; }
        .bar { display: flex; gap: 8px; align-items: stretch; }
        button {
          flex: 1; padding: 10px 8px; border: 2px solid #e2e8f0; background: #fff; border-radius: 12px;
          cursor: pointer; font: inherit; text-align: center; transition: all .15s;
        }
        button:hover { border-color: #94a3b8; }
        button.active { border-color: #2563eb; background: #eff6ff; box-shadow: 0 3px 10px rgba(37,99,235,.2); }
        .label { font-size: 14px; font-weight: 700; color: #0f172a; }
        .time { font-size: 11px; color: #64748b; margin-top: 2px; }
        .dot { display:inline-block; width:9px; height:9px; border-radius:50%; margin-right:5px; vertical-align: middle; }
      </style>
      <div class="bar" id="bar"></div>
    `;
    const bar = root.getElementById('bar')!;
    for (const p of PERIODS) {
      const btn = document.createElement('button');
      btn.dataset.period = p.id;
      btn.innerHTML = `<div class="label"><span class="dot" style="background:${p.sky};border:1px solid #94a3b8"></span>${p.label}</div><div class="time">${p.time}</div>`;
      btn.addEventListener('click', () => store.setPeriod(p.id as PeriodId));
      bar.appendChild(btn);
    }
    store.subscribe(() => {
      const cur = store.get().period;
      bar.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.period === cur));
    });
  }
}

customElements.define('time-line', Timeline);
