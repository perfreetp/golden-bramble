// 应用外壳：组件注册、拖放投放、键盘快捷键、页签切换
import './components/stage-editor';
import './components/lamp-library';
import './components/timeline';
import './components/inspector';
import './components/zone-stats';
import './components/toolbar';
import './components/batch-qc';
import './components/plan-meta';
import './components/heat-legend';
import { store } from './store';

class AppShell extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host { display:block; min-height:100vh; background:#f1f5f9; color:#0f172a; font-family:system-ui,-apple-system,sans-serif; }
        header { background:linear-gradient(90deg,#0f766e,#0d9488); color:#fff; padding:14px 22px; display:flex; align-items:center; gap:14px; }
        header h1 { font-size:18px; margin:0; font-weight:800; }
        header .sub { font-size:12px; opacity:.85; }
        .tabs { display:flex; gap:6px; margin-left:auto; }
        .tabs button { padding:7px 18px; border-radius:99px; border:1px solid rgba(255,255,255,.4); background:transparent;
          color:#fff; font:inherit; font-size:13px; font-weight:700; cursor:pointer; }
        .tabs button.active { background:#fff; color:#0f766e; }
        main { padding:16px 22px 30px; max-width:1500px; margin:0 auto; }
        .view { display:none; }
        .view.active { display:block; }
        .layout { display:grid; grid-template-columns: 230px 1fr 268px; gap:14px; align-items:start; }
        .card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px; padding:12px; }
        .stage-wrap { position:relative; }
        .stage-wrap.dragover stage-editor { outline:3px dashed #0d9488; outline-offset:3px; border-radius:12px; }
        .bottom { display:grid; grid-template-columns:1fr 260px; gap:14px; margin-top:14px; align-items:start; }
        .legend-row { display:flex; justify-content:space-between; align-items:center; margin-top:10px; flex-wrap:wrap; gap:8px; }
        @media (max-width: 1100px) { .layout { grid-template-columns:1fr; } .bottom { grid-template-columns:1fr; } }
      </style>
      <header>
        <h1>🦎 爬宠饲养箱剖面布光预览工具</h1>
        <span class="sub">多灯照度叠加 · 遮挡软阴影 · 四时段模拟 · 批次质检放行</span>
        <div class="tabs">
          <button data-view="design" class="active">布光设计台</button>
          <button data-view="qc">批次质检台</button>
        </div>
      </header>
      <main>
        <section class="view active" data-view="design">
          <tool-bar style="display:block;margin-bottom:14px"></tool-bar>
          <div class="layout">
            <div class="card">
              <lamp-library></lamp-library>
              <obstacle-library></obstacle-library>
            </div>
            <div>
              <div class="card stage-wrap" id="stageWrap">
                <stage-editor></stage-editor>
              </div>
              <div class="card legend-row">
                <heat-legend></heat-legend>
                <time-line></time-line>
              </div>
            </div>
            <div class="card">
              <plan-meta style="margin-bottom:12px"></plan-meta>
              <prop-inspector></prop-inspector>
            </div>
          </div>
          <div class="bottom">
            <div class="card"><zone-stats></zone-stats></div>
            <div class="card" style="font-size:11px;color:#64748b;line-height:1.8">
              <b style="color:#334155">操作说明</b><br>
              · 从左侧拖入灯具/遮挡物，或点击卡片投放<br>
              · 拖动灯体移动位置（网格吸附）<br>
              · 选中灯后拖黄色手柄调照射角度（角度对齐）<br>
              · 拖动中实时重算照度与软阴影<br>
              · Delete 键删除选中元素，Ctrl+Z / Ctrl+Y 撤销重做<br>
              · 红虚线框 = 平均照度低于 200 lux 的暗区
            </div>
          </div>
        </section>
        <section class="view" data-view="qc">
          <batch-qc></batch-qc>
        </section>
      </main>
    `;

    // 页签切换
    root.querySelectorAll<HTMLButtonElement>('.tabs button').forEach(btn => {
      btn.addEventListener('click', () => {
        root.querySelectorAll<HTMLButtonElement>('.tabs button').forEach(b => b.classList.toggle('active', b === btn));
        root.querySelectorAll<HTMLElement>('.view').forEach(v => v.classList.toggle('active', v.dataset.view === btn.dataset.view));
      });
    });

    // 拖放投放
    const wrap = root.getElementById('stageWrap')!;
    const stage = root.querySelector('stage-editor')!;
    wrap.addEventListener('dragover', e => {
      if (e.dataTransfer?.types.includes('application/x-lamp-kind') || e.dataTransfer?.types.includes('application/x-obstacle-kind')) {
        e.preventDefault();
        wrap.classList.add('dragover');
        e.dataTransfer.dropEffect = 'copy';
      }
    });
    wrap.addEventListener('dragleave', () => wrap.classList.remove('dragover'));
    wrap.addEventListener('drop', e => {
      e.preventDefault();
      wrap.classList.remove('dragover');
      const lampKind = e.dataTransfer?.getData('application/x-lamp-kind');
      const obsKind = e.dataTransfer?.getData('application/x-obstacle-kind');
      const svg = stage.shadowRoot?.querySelector('svg') as SVGSVGElement | null;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const s = rect.height / store.get().plan.heightCm;
      const cx = (e.clientX - rect.left) / s;
      const cy = store.get().plan.heightCm - (e.clientY - rect.top) / s;
      const x = Math.min(Math.max(cx, 1), store.get().plan.widthCm - 1);
      const y = Math.min(Math.max(cy, 1), store.get().plan.heightCm - 1);
      if (lampKind) store.addLamp(lampKind as Parameters<typeof store.addLamp>[0], x, y);
      if (obsKind) store.addObstacle(obsKind as Parameters<typeof store.addObstacle>[0], x, y);
    });

    // 键盘：删除 / 撤销 / 重做
    window.addEventListener('keydown', e => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) store.redo(); else store.undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        store.redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const sel = store.get().selection;
        if (!sel) return;
        e.preventDefault();
        if (sel.type === 'lamp') store.removeLamp(sel.id);
        else store.removeObstacle(sel.id);
      } else if (e.key === 'Escape') {
        store.clearSelection();
      }
    });

    // 点击空白处取消选择（展示图层已 pointer-events:none，空白点击的目标即 svg 根）
    stage.shadowRoot?.querySelector('svg')?.addEventListener('pointerdown', e => {
      if (e.target === e.currentTarget) store.clearSelection();
    });
  }
}

customElements.define('app-shell', AppShell);
