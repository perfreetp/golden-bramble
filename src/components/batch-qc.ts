// 批次质检：导入方案 → 自动检查 → 问题分级 → 复核员逐条确认/驳回 → 整批放行/退回
import { store } from '../store';
import { severityLabel } from '../engine/qc';
import type { BatchResult, QcIssue, Severity } from '../types';

const SEV_STYLE: Record<Severity, { bg: string; color: string; icon: string }> = {
  critical: { bg: '#fee2e2', color: '#b91c1c', icon: '⛔' },
  major: { bg: '#ffedd5', color: '#c2410c', icon: '⚠️' },
  minor: { bg: '#fef9c3', color: '#a16207', icon: '🔸' }
};

export class BatchQc extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host { display:block; }
        h3 { margin:0 0 10px; font-size:13px; color:#475569; display:flex; justify-content:space-between; align-items:center; }
        .import { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px; }
        button { padding:7px 13px; border:1px solid #cbd5e1; background:#fff; border-radius:8px; cursor:pointer;
          font:inherit; font-size:12px; font-weight:600; color:#1e293b; }
        button:hover { background:#f1f5f9; }
        button.primary { background:#2563eb; color:#fff; border-color:#2563eb; }
        button.danger { background:#dc2626; color:#fff; border-color:#dc2626; }
        button.success { background:#16a34a; color:#fff; border-color:#16a34a; }
        button:disabled { opacity:.45; cursor:not-allowed; }
        .summary { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px; }
        .pill { font-size:11px; font-weight:700; padding:4px 10px; border-radius:99px; }
        .verdict { font-size:13px; font-weight:800; padding:10px 12px; border-radius:10px; margin-bottom:10px; text-align:center; }
        .v-pending { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; }
        .v-released { background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; }
        .v-returned { background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; }
        .issue { background:#fff; border:1px solid #e2e8f0; border-left-width:4px; border-radius:8px; padding:9px 11px; margin-bottom:7px; }
        .issue.confirmed { opacity:.75; background:#fff7f7; }
        .issue.rejected { opacity:.55; }
        .head { display:flex; justify-content:space-between; gap:8px; align-items:center; }
        .code { font-size:10px; color:#94a3b8; font-family:monospace; }
        .msg { font-size:12px; color:#1e293b; line-height:1.55; margin:5px 0; }
        .meta { font-size:10px; color:#64748b; margin-bottom:7px; }
        .acts { display:flex; gap:6px; }
        .acts button { padding:4px 10px; font-size:11px; }
        .status-tag { font-size:10px; font-weight:700; padding:2px 8px; border-radius:99px; }
        .st-open { background:#e0e7ff; color:#3730a3; }
        .st-confirmed { background:#fee2e2; color:#b91c1c; }
        .st-rejected { background:#f1f5f9; color:#64748b; }
        .empty { font-size:12px; color:#94a3b8; text-align:center; padding:16px; border:1px dashed #cbd5e1; border-radius:10px; }
        input[type=file] { display:none; }
      </style>
      <h3>批次质检 <span id="batchId"></span></h3>
      <div class="import">
        <button class="primary" id="pick">📥 导入方案批次（JSON，可多选）</button>
        <button id="demo">生成演示批次</button>
        <button id="clear">清空</button>
        <input type="file" id="file" accept=".json,application/json" multiple>
      </div>
      <div id="content"><div class="empty">质检员导入供应方提交的一批饲养箱方案后，系统自动执行全部检查规则</div></div>
    `;
    root.getElementById('pick')!.addEventListener('click', () => (root.getElementById('file') as HTMLInputElement).click());
    (root.getElementById('file') as HTMLInputElement).addEventListener('change', e => this.onFiles(e));
    root.getElementById('demo')!.addEventListener('click', () => this.loadDemo());
    root.getElementById('clear')!.addEventListener('click', () => store.clearBatch());
    store.subscribe(() => this.render());
    this.render();
  }

  private async onFiles(e: Event) {
    const input = e.target as HTMLInputElement;
    const plans = [];
    for (const file of Array.from(input.files ?? [])) {
      try {
        const text = await file.text();
        plans.push(...store.parsePlans(text));
      } catch (err) {
        alert(`文件 ${file.name} 解析失败：${(err as Error).message}`);
      }
    }
    input.value = '';
    if (plans.length) store.importBatch(plans);
  }

  private loadDemo() {
    // 构造一批覆盖各类问题的演示方案
    const good = store.parsePlans(JSON.stringify([store.get().plan]))[0];
    good.name = '合格方案 · 90cm 标准箱';
    const badNoUvb = store.parsePlans(JSON.stringify(good))[0];
    badNoUvb.id = badNoUvb.id + '-b1';
    badNoUvb.name = '缺 UVB 方案';
    badNoUvb.lamps = badNoUvb.lamps.filter(l => l.kind !== 'uvb');
    const badNight = store.parsePlans(JSON.stringify(good))[0];
    badNight.id = badNight.id + '-b2';
    badNight.name = '夜间错开灯方案';
    badNight.lamps.forEach(l => { l.schedule.night = true; });
    const badTilt = store.parsePlans(JSON.stringify(good))[0];
    badTilt.id = badTilt.id + '-b3';
    badTilt.name = '灯位角度异常方案（45cm 小箱）';
    badTilt.widthCm = 45;
    badTilt.heightCm = 35;
    badTilt.lamps.forEach((l, i) => { l.x = 8 + i * 9; l.y = 30; l.angle = -20; });
    badTilt.obstacles = badTilt.obstacles.slice(0, 1);
    store.importBatch([good, badNoUvb, badNight, badTilt]);
  }

  private render() {
    const batch = store.get().batch;
    const host = this.shadowRoot!.getElementById('content')!;
    this.shadowRoot!.getElementById('batchId')!.textContent = batch ? `#${batch.batchId.slice(-6)}` : '';
    if (!batch) {
      host.innerHTML = `<div class="empty">质检员导入供应方提交的一批饲养箱方案后，系统自动执行全部检查规则</div>`;
      return;
    }
    host.innerHTML = `
      ${this.summaryHtml(batch)}
      <div id="issues"></div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="success" id="release" ${batch.verdict === 'pending' ? 'disabled' : ''}>✅ 整批达标，放行</button>
        <button class="danger" id="return" ${batch.verdict === 'pending' ? 'disabled' : ''}>↩️ 不达标，退回供应方</button>
      </div>
    `;
    const list = host.querySelector('#issues')!;
    const byPlan = new Map<string, QcIssue[]>();
    for (const iss of batch.issues) {
      const arr = byPlan.get(iss.planName) ?? [];
      arr.push(iss);
      byPlan.set(iss.planName, arr);
    }
    if (batch.issues.length === 0) {
      list.innerHTML = `<div class="empty" style="border-color:#86efac;color:#15803d">🎉 全部 ${batch.plans.length} 个方案未检出问题，可直接放行</div>`;
    } else {
      list.innerHTML = [...byPlan.entries()].map(([planName, issues]) => `
        <div style="font-size:12px;font-weight:800;color:#0f172a;margin:10px 0 6px">📦 ${planName}（${issues.length} 项）</div>
        ${issues.map(i => this.issueHtml(i)).join('')}
      `).join('');
    }
    host.querySelectorAll<HTMLElement>('[data-confirm]').forEach(b =>
      b.addEventListener('click', () => store.reviewIssue(b.dataset.confirm!, 'confirmed')));
    host.querySelectorAll<HTMLElement>('[data-reject]').forEach(b =>
      b.addEventListener('click', () => store.reviewIssue(b.dataset.reject!, 'rejected')));
    host.querySelector('#release')?.addEventListener('click', () => store.finalizeBatch('released'));
    host.querySelector('#return')?.addEventListener('click', () => store.finalizeBatch('returned'));
  }

  private summaryHtml(batch: BatchResult): string {
    const cnt = (sev: Severity, st?: QcIssue['status']) =>
      batch.issues.filter(i => i.severity === sev && (!st || i.status === st)).length;
    const open = batch.issues.filter(i => i.status === 'open').length;
    const verdictText: Record<BatchResult['verdict'], string> = {
      pending: `⏳ 待复核：还有 ${open} 项问题未处理，全部复核后才能放行或退回`,
      released: '✅ 已放行：本批方案符合验收标准，准予入库',
      returned: '↩️ 已退回：存在确认问题，退回供应方整改后重新提交'
    };
    return `
      <div class="summary">
        <span class="pill" style="background:#fee2e2;color:#b91c1c">⛔ 严重 ${cnt('critical')}（待处理 ${cnt('critical', 'open')}）</span>
        <span class="pill" style="background:#ffedd5;color:#c2410c">⚠️ 主要 ${cnt('major')}（待处理 ${cnt('major', 'open')}）</span>
        <span class="pill" style="background:#fef9c3;color:#a16207">🔸 一般 ${cnt('minor')}（待处理 ${cnt('minor', 'open')}）</span>
        <span class="pill" style="background:#f1f5f9;color:#475569">方案 ${batch.plans.length} 个</span>
      </div>
      <div class="verdict v-${batch.verdict}">${verdictText[batch.verdict]}</div>
    `;
  }

  private issueHtml(i: QcIssue): string {
    const st = SEV_STYLE[i.severity];
    const statusCls = i.status === 'open' ? 'st-open' : i.status === 'confirmed' ? 'st-confirmed' : 'st-rejected';
    const statusText = i.status === 'open' ? '待复核' : i.status === 'confirmed' ? '已确认' : '已驳回';
    return `
      <div class="issue ${i.status}" style="border-left-color:${st.color}">
        <div class="head">
          <span class="pill" style="background:${st.bg};color:${st.color}">${st.icon} ${severityLabel(i.severity)}</span>
          <span><span class="code">${i.code}</span> <span class="status-tag ${statusCls}">${statusText}</span></span>
        </div>
        <div class="msg">${i.message}</div>
        <div class="acts">
          ${i.status === 'open'
            ? `<button data-confirm="${i.id}">✓ 确认问题</button><button data-reject="${i.id}">✕ 驳回</button>`
            : `<button data-reject="${i.id}">重新复核</button>`}
        </div>
      </div>`;
  }
}

customElements.define('batch-qc', BatchQc);
