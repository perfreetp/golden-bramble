/** 参数面板：编织规则、密度、带材宽度、幅面尺寸、种子、编辑模式 */

import { RULE_LABELS, WeaveRule } from '../core/types';
import { EditMode, store } from '../state/store';
import { PANEL_CSS } from './common';

const MODES: { key: EditMode; label: string; hint: string }[] = [
  { key: 'pan', label: '平移', hint: '拖拽平移画布' },
  { key: 'flip', label: '改压叠', hint: '点击单元翻转经/纬压叠（记为手工项）' },
  { key: 'color', label: '改色', hint: '点击带材改为当前色带（记为手工项）' },
  { key: 'lock', label: '锁区域', hint: '拖出矩形锁定，重掷时该区域不变' },
];

export class ParamPanel extends HTMLElement {
  private unsub?: () => void;

  connectedCallback(): void {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>${PANEL_CSS}
      .grid2 { display: grid; grid-template-columns: auto 1fr auto 1fr; gap: 4px 6px; align-items: center; }
      .grid2 input { width: 64px; }
      .modes button { margin-right: 4px; margin-bottom: 4px; }
      fieldset { border: 1px solid #3c4148; border-radius: 6px; margin: 0 0 10px; padding: 8px; }
      legend { color: #d8c98f; font-size: 12px; padding: 0 4px; }
    </style>
    <fieldset>
      <legend>编织规则</legend>
      <div class="row"><select id="rule"></select></div>
      <div class="row" id="twillRow"><label>斜纹飞数</label><input id="twillStep" type="number" min="1" max="3" step="1"></div>
    </fieldset>
    <fieldset>
      <legend>材料与密度</legend>
      <div class="grid2">
        <label>经密</label><input id="warpDensity" type="number" min="5" max="60" step="1" title="根/10cm">
        <label>纬密</label><input id="weftDensity" type="number" min="5" max="60" step="1" title="根/10cm">
        <label>带材宽</label><input id="stripWidth" type="number" min="1" max="10" step="0.1" title="mm">
        <label>种子</label><input id="seed" type="number" step="1">
        <label>幅宽</label><input id="widthMm" type="number" min="100" max="3000" step="10" title="mm">
        <label>幅高</label><input id="heightMm" type="number" min="100" max="3000" step="10" title="mm">
      </div>
      <div class="row" style="margin-top:6px">
        <button id="regen" class="primary">按参数生成</button>
        <button id="reroll">重掷种子</button>
        <button id="fit">适应窗口</button>
      </div>
      <div class="hint">同一种子 + 同一组参数，每次生成结果完全一致。重掷只影响未锁定区域，手工项保留。</div>
    </fieldset>
    <fieldset>
      <legend>编辑模式</legend>
      <div class="modes" id="modes"></div>
      <div class="hint" id="modeHint"></div>
      <div class="row">
        <button id="clearLocks">清除锁定</button>
        <button id="clearManual" class="danger">清除手工项</button>
      </div>
      <div class="row">
        <label><input type="checkbox" id="showSeams" style="max-width:none"> 拼缝</label>
        <label><input type="checkbox" id="showManual" style="max-width:none"> 手工标记</label>
      </div>
    </fieldset>
    <fieldset>
      <legend>拼片裁切</legend>
      <div class="row"><label>拼片边长</label><input id="tileSize" type="number" min="100" max="2000" step="10"> mm</div>
    </fieldset>`;

    const $ = <T extends HTMLElement>(selector: string) =>
      shadow.querySelector(selector) as T;

    const ruleSel = $<HTMLSelectElement>('#rule');
    for (const [k, label] of Object.entries(RULE_LABELS)) {
      ruleSel.append(new Option(label, k));
    }

    // 模式按钮
    const modesBox = shadow.querySelector('#modes') as HTMLDivElement;
    for (const m of MODES) {
      const btn = document.createElement('button');
      btn.textContent = m.label;
      btn.dataset.mode = m.key;
      btn.addEventListener('click', () => store.set({ mode: m.key }));
      modesBox.append(btn);
    }

    const num = (id: string, key: keyof typeof store.state.params) => {
      $(id).addEventListener('change', (e) => {
        const v = Number((e.target as HTMLInputElement).value);
        if (Number.isFinite(v)) store.setParams({ [key]: v } as never);
      });
    };
    num('#warpDensity', 'warpDensity');
    num('#weftDensity', 'weftDensity');
    num('#stripWidth', 'stripWidth');
    num('#seed', 'seed');
    num('#widthMm', 'widthMm');
    num('#heightMm', 'heightMm');
    num('#twillStep', 'twillStep');

    ruleSel.addEventListener('change', () => store.setParams({ rule: ruleSel.value as WeaveRule }));
    $<HTMLButtonElement>('#regen').addEventListener('click', () => store.setParams({}));
    $<HTMLButtonElement>('#reroll').addEventListener('click', () => store.reroll());
    $<HTMLButtonElement>('#fit').addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('weave:fit'));
    });
    $<HTMLButtonElement>('#clearLocks').addEventListener('click', () => store.clearLocks());
    $<HTMLButtonElement>('#clearManual').addEventListener('click', () => store.clearManual());
    $<HTMLInputElement>('#showSeams').addEventListener('change', (e) =>
      store.set({ showSeams: (e.target as HTMLInputElement).checked }),
    );
    $<HTMLInputElement>('#showManual').addEventListener('change', (e) =>
      store.set({ showManualMarks: (e.target as HTMLInputElement).checked }),
    );
    $<HTMLInputElement>('#tileSize').addEventListener('change', (e) => {
      const v = Number((e.target as HTMLInputElement).value);
      if (v >= 50) store.set({ tileSizeMm: v });
    });

    this.unsub = store.subscribe(() => this.sync());
    this.sync();
  }

  disconnectedCallback(): void {
    this.unsub?.();
  }

  private sync(): void {
    const s = store.state;
    const shadow = this.shadowRoot!;
    const set = (id: string, v: string | number) => {
      (shadow.querySelector(id) as HTMLInputElement).value = String(v);
    };
    set('#warpDensity', s.params.warpDensity);
    set('#weftDensity', s.params.weftDensity);
    set('#stripWidth', s.params.stripWidth);
    set('#seed', s.params.seed);
    set('#widthMm', s.params.widthMm);
    set('#heightMm', s.params.heightMm);
    set('#twillStep', s.params.twillStep);
    set('#tileSize', s.tileSizeMm);
    (shadow.querySelector('#rule') as HTMLSelectElement).value = s.params.rule;
    (shadow.querySelector('#twillRow') as HTMLDivElement).style.display =
      s.params.rule === 'twill' ? '' : 'none';
    (shadow.querySelector('#showSeams') as HTMLInputElement).checked = s.showSeams;
    (shadow.querySelector('#showManual') as HTMLInputElement).checked = s.showManualMarks;
    for (const btn of shadow.querySelectorAll<HTMLButtonElement>('.modes button')) {
      btn.classList.toggle('active', btn.dataset.mode === s.mode);
    }
    const m = MODES.find((x) => x.key === s.mode);
    (shadow.querySelector('#modeHint') as HTMLDivElement).textContent = m?.hint ?? '';
  }
}

customElements.define('param-panel', ParamPanel);
