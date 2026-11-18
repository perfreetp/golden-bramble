// 方案元信息：名称 / 物种 / 箱体尺寸 + 单方案 JSON 导入
import { store } from '../store';

export class PlanMeta extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host { display:block; }
        .panel { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:12px; }
        .row { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
        label { font-size:12px; color:#475569; width:64px; flex:none; }
        input { flex:1; min-width:0; padding:6px 8px; border:1px solid #cbd5e1; border-radius:7px; font:inherit; font-size:12px; }
        .dim { display:flex; gap:6px; align-items:center; }
        .dim input { width:70px; flex:none; }
        .btns { display:flex; gap:8px; margin-top:4px; }
        button { padding:7px 12px; border:1px solid #cbd5e1; background:#fff; border-radius:8px; cursor:pointer;
          font:inherit; font-size:12px; font-weight:600; color:#1e293b; }
        button:hover { background:#f1f5f9; }
        input[type=file] { display:none; }
      </style>
      <div class="panel">
        <div class="row"><label>方案名称</label><input id="name" type="text"></div>
        <div class="row"><label>物种</label><input id="species" type="text" placeholder="如：鬃狮蜥"></div>
        <div class="row"><label>箱体尺寸</label>
          <div class="dim"><input id="w" type="number" min="20" max="300" step="5"> cm × <input id="h" type="number" min="20" max="200" step="5"> cm</div>
        </div>
        <div class="btns">
          <button id="import">📂 载入方案 JSON</button>
          <input type="file" id="file" accept=".json,application/json">
        </div>
      </div>
    `;
    const $ = <T extends HTMLElement>(id: string) => root.getElementById(id) as T;
    const fill = () => {
      const p = store.get().plan;
      $('name').setAttribute('value', p.name);
      ($('name') as HTMLInputElement).value = p.name;
      ($('species') as HTMLInputElement).value = p.species;
      ($('w') as HTMLInputElement).value = String(p.widthCm);
      ($('h') as HTMLInputElement).value = String(p.heightCm);
    };
    fill();
    store.subscribe(fill);
    ($('name') as HTMLInputElement).addEventListener('change', e => store.updatePlanMeta({ name: (e.target as HTMLInputElement).value }));
    ($('species') as HTMLInputElement).addEventListener('change', e => store.updatePlanMeta({ species: (e.target as HTMLInputElement).value }));
    ($('w') as HTMLInputElement).addEventListener('change', e => store.updatePlanMeta({ widthCm: parseInt((e.target as HTMLInputElement).value) || 90 }));
    ($('h') as HTMLInputElement).addEventListener('change', e => store.updatePlanMeta({ heightCm: parseInt((e.target as HTMLInputElement).value) || 45 }));
    $('import').addEventListener('click', () => ($('file') as HTMLInputElement).click());
    ($('file') as HTMLInputElement).addEventListener('change', async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const plans = store.parsePlans(await file.text());
        if (plans[0]) store.loadPlan(plans[0]);
      } catch (err) {
        alert(`方案解析失败：${(err as Error).message}`);
      }
      (e.target as HTMLInputElement).value = '';
    });
  }
}

customElements.define('plan-meta', PlanMeta);
