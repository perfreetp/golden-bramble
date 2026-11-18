// 顶部工具栏：吸附开关、网格/角度步长、热力图/光锥开关、撤销重做、导出
import { store } from '../store';
import { exportSvg, exportPng, exportCsv, exportPlanJson } from '../exporter';

export class ToolBar extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host { display:flex; flex-wrap:wrap; gap:10px; align-items:center; }
        .group { display:flex; align-items:center; gap:6px; background:#fff; border:1px solid #e2e8f0;
          border-radius:10px; padding:6px 10px; font-size:12px; color:#334155; }
        button { padding:6px 12px; border:1px solid #cbd5e1; background:#fff; border-radius:8px; cursor:pointer;
          font:inherit; font-size:12px; font-weight:600; color:#1e293b; }
        button:hover { background:#f1f5f9; }
        button:disabled { opacity:.4; cursor:default; }
        button.primary { background:#2563eb; color:#fff; border-color:#2563eb; }
        button.primary:hover { background:#1d4ed8; }
        input[type=number] { width:52px; padding:4px 6px; border:1px solid #cbd5e1; border-radius:6px; font:inherit; font-size:12px; }
        .sep { width:1px; height:26px; background:#e2e8f0; }
      </style>
      <div class="group">
        <label><input type="checkbox" id="snap"> 网格吸附</label>
        步长 <input type="number" id="gridCm" min="1" max="20" step="1"> cm
      </div>
      <div class="group">
        角度对齐 <input type="number" id="angle" min="5" max="90" step="5"> °
      </div>
      <div class="group">
        <label><input type="checkbox" id="heat"> 热力图</label>
        <label><input type="checkbox" id="cone"> 光锥</label>
      </div>
      <div class="sep"></div>
      <div class="group">
        <button id="undo">↶ 撤销</button>
        <button id="redo">↷ 重做</button>
      </div>
      <div class="sep"></div>
      <div class="group">
        <button id="svg">导出 SVG</button>
        <button id="png">导出 PNG</button>
        <button id="csv">照度分区表</button>
        <button id="json" class="primary">导出方案 JSON</button>
      </div>
    `;
    const $ = <T extends HTMLElement>(id: string) => root.getElementById(id) as T;
    const s = store.get().settings;
    ($('snap') as HTMLInputElement).checked = s.snap;
    ($('gridCm') as HTMLInputElement).value = String(s.gridCm);
    ($('angle') as HTMLInputElement).value = String(s.angleSnapDeg);
    ($('heat') as HTMLInputElement).checked = s.showHeatmap;
    ($('cone') as HTMLInputElement).checked = s.showCone;

    $('snap').addEventListener('change', e => store.updateSettings({ snap: (e.target as HTMLInputElement).checked }));
    $('gridCm').addEventListener('change', e => store.updateSettings({ gridCm: Math.max(1, parseInt((e.target as HTMLInputElement).value) || 5) }));
    $('angle').addEventListener('change', e => store.updateSettings({ angleSnapDeg: Math.max(5, parseInt((e.target as HTMLInputElement).value) || 15) }));
    $('heat').addEventListener('change', e => store.updateSettings({ showHeatmap: (e.target as HTMLInputElement).checked }));
    $('cone').addEventListener('change', e => store.updateSettings({ showCone: (e.target as HTMLInputElement).checked }));
    $('undo').addEventListener('click', () => store.undo());
    $('redo').addEventListener('click', () => store.redo());
    $('svg').addEventListener('click', () => {
      const { plan, period } = store.get();
      exportSvg(plan, period, store.currentField());
    });
    $('png').addEventListener('click', async () => {
      const { plan, period } = store.get();
      await exportPng(plan, period, store.currentField());
    });
    $('csv').addEventListener('click', () => exportCsv(store.get().plan));
    $('json').addEventListener('click', () => exportPlanJson(store.get().plan));

    const updateHistory = () => {
      ($('undo') as HTMLButtonElement).disabled = !store.canUndo;
      ($('redo') as HTMLButtonElement).disabled = !store.canRedo;
    };
    store.subscribe(updateHistory);
    updateHistory();
  }
}

customElements.define('tool-bar', ToolBar);
