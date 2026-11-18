// 灯具库：拖拽到剖面投放灯具，也支持点击投放
import { LAMP_LIBRARY } from '../constants';
import { store } from '../store';
import type { LampKind } from '../types';

export class LampLibrary extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host { display: block; }
        h3 { margin: 0 0 8px; font-size: 13px; color: #475569; }
        .card {
          display: flex; align-items: center; gap: 10px; padding: 9px 10px; margin-bottom: 8px;
          background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; cursor: grab;
          transition: box-shadow .15s, transform .15s;
        }
        .card:hover { box-shadow: 0 4px 14px rgba(15,23,42,.1); transform: translateY(-1px); border-color: #94a3b8; }
        .card:active { cursor: grabbing; }
        .dot { width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid #1f2937; flex: none; }
        .dot.tube { width: 22px; border-radius: 4px; height: 8px; }
        .meta { min-width: 0; }
        .name { font-size: 13px; font-weight: 700; color: #0f172a; }
        .desc { font-size: 11px; color: #64748b; line-height: 1.4; margin-top: 2px; }
        .hint { font-size: 11px; color: #94a3b8; margin-top: 4px; }
      </style>
      <h3>灯具库（拖入剖面）</h3>
      <div id="list"></div>
      <p class="hint">拖拽到箱内任意位置投放，或点击后在箱内点击放置</p>
    `;
    const list = root.getElementById('list')!;
    for (const spec of LAMP_LIBRARY) {
      const card = document.createElement('div');
      card.className = 'card';
      card.draggable = true;
      card.innerHTML = `
        <span class="dot ${spec.length > 0 ? 'tube' : ''}" style="background:${spec.color}"></span>
        <div class="meta">
          <div class="name">${spec.label}</div>
          <div class="desc">${spec.desc}</div>
        </div>
      `;
      card.addEventListener('dragstart', e => {
        e.dataTransfer?.setData('application/x-lamp-kind', spec.kind);
        e.dataTransfer!.effectAllowed = 'copy';
      });
      card.addEventListener('click', () => {
        const { plan } = store.get();
        store.addLamp(spec.kind, plan.widthCm * (0.3 + Math.random() * 0.4), plan.heightCm - 5);
      });
      list.appendChild(card);
    }
  }
}

export class ObstacleLibrary extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    const items: Array<{ kind: LampKind | 'hide' | 'branch' | 'dish'; label: string; color: string; desc: string }> = [
      { kind: 'hide', label: '躲避穴', color: '#78716c', desc: '不透光，形成本影区' },
      { kind: 'branch', label: '树枝', color: '#92400e', desc: '部分透光，产生斑驳软阴影' },
      { kind: 'dish', label: '水盆', color: '#38bdf8', desc: '浅水弱透光，近全遮挡' }
    ];
    root.innerHTML = `
      <style>
        h3 { margin: 14px 0 8px; font-size: 13px; color: #475569; }
        .card { display:flex; gap:10px; align-items:center; padding:8px 10px; margin-bottom:8px; background:#fff;
          border:1px solid #e2e8f0; border-radius:10px; cursor:grab; }
        .card:hover { border-color:#94a3b8; box-shadow:0 4px 14px rgba(15,23,42,.1); }
        .sw { width:18px; height:14px; border-radius:3px; flex:none; border:1px solid #1f2937; }
        .name { font-size:13px; font-weight:700; color:#0f172a; }
        .desc { font-size:11px; color:#64748b; }
      </style>
      <h3>遮挡物（拖入剖面）</h3>
      <div id="list"></div>
    `;
    const list = root.getElementById('list')!;
    for (const it of items) {
      const card = document.createElement('div');
      card.className = 'card';
      card.draggable = true;
      card.innerHTML = `<span class="sw" style="background:${it.color}"></span><div><div class="name">${it.label}</div><div class="desc">${it.desc}</div></div>`;
      card.addEventListener('dragstart', e => {
        e.dataTransfer?.setData('application/x-obstacle-kind', it.kind);
        e.dataTransfer!.effectAllowed = 'copy';
      });
      card.addEventListener('click', () => {
        const { plan } = store.get();
        store.addObstacle(it.kind as 'hide' | 'branch' | 'dish', plan.widthCm / 2, 8);
      });
      list.appendChild(card);
    }
  }
}

customElements.define('lamp-library', LampLibrary);
customElements.define('obstacle-library', ObstacleLibrary);
