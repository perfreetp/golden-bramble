import type { Submission } from '../core/types.js';
import { store } from '../core/store.js';
import { h, clear, SHARED_CSS } from './dom.js';
import { downloadBlob } from '../core/math.js';

interface Row {
  studentId: string;
  studentName: string;
  taskTitle: string;
  auto: number;
  teacher: number | null;
  total: number | null;
  status: 'submitted' | 'reviewed' | 'none';
  errors: string[];
  jumps: number;
}

export class ScreenClassDashboard extends HTMLElement {
  connectedCallback(): void {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = /* html */ `
      <style>
        ${SHARED_CSS}
        :host { display: block; height: 100%; overflow: auto; }
        .wrap { max-width: 1180px; margin: 0 auto; padding: 24px; }
        h2 { margin: 0 0 16px; font-size: 20px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
        .stat { text-align: left; }
        .stat .num { font-size: 28px; font-weight: 700; color: var(--accent); }
        .stat .lab { font-size: 12px; color: var(--fg-faint); margin-top: 2px; }
        .panels { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
        .bar-row { display: flex; align-items: center; gap: 8px; margin: 8px 0; font-size: 12px; }
        .bar-row .lab { width: 72px; color: var(--fg-dim); flex: none; }
        .bar-track { flex: 1; height: 18px; background: var(--bg-input); border-radius: 4px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 4px; transition: width .4s; }
        .bar-row .val { width: 34px; text-align: right; color: var(--fg-dim); font-family: monospace; }
        table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
        th, td { padding: 9px 10px; text-align: left; border-bottom: 1px solid var(--border); }
        th { color: var(--fg-faint); font-weight: 600; position: sticky; top: 0; background: var(--bg-panel); }
        tr:hover td { background: var(--bg-panel-2); }
        .err-tag { display: inline-block; font-size: 10px; padding: 1px 6px; border-radius: 999px; border: 1px solid var(--bad); color: var(--bad); margin: 1px 2px; }
        .table-wrap { max-height: 380px; overflow: auto; border: 1px solid var(--border); border-radius: var(--radius); }
        .toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 12px; }
      </style>
      <div class="wrap">
        <div class="toolbar">
          <h2 style="margin:0;flex:1">📊 班级成绩与错题汇总</h2>
          <select id="klass-select"></select>
          <select id="task-select"></select>
          <button id="csv">⬇ 导出 CSV</button>
        </div>
        <div class="stats" id="stats"></div>
        <div class="panels">
          <div class="card">
            <b>成绩段分布（已复核）</b>
            <div id="dist"></div>
          </div>
          <div class="card">
            <b>错题类型排行</b>
            <div id="errors"></div>
          </div>
        </div>
        <div class="card">
          <b>学生明细</b>
          <div class="table-wrap" style="margin-top:10px">
            <table>
              <thead><tr>
                <th>学号</th><th>姓名</th><th>任务</th><th>自动评分</th><th>教师评分</th><th>总分</th><th>状态</th><th>跳变帧</th><th>错题</th>
              </tr></thead>
              <tbody id="tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const klassSel = root.querySelector<HTMLSelectElement>('#klass-select')!;
    const taskSel = root.querySelector<HTMLSelectElement>('#task-select')!;
    store.klasses.forEach((k) => klassSel.appendChild(h('option', { value: k.id, textContent: k.name })));
    store.tasks.forEach((t) => taskSel.appendChild(h('option', { value: t.id, textContent: t.title })));
    klassSel.addEventListener('change', () => this.render());
    taskSel.addEventListener('change', () => this.render());
    root.querySelector('#csv')!.addEventListener('click', () => this.exportCsv());
    this.render();
  }

  private collectRows(): Row[] {
    const klassId = this.shadowRoot!.querySelector<HTMLSelectElement>('#klass-select')!.value || store.klasses[0]?.id;
    const taskId = this.shadowRoot!.querySelector<HTMLSelectElement>('#task-select')!.value || store.tasks[0]?.id;
    const klass = store.getKlass(klassId);
    const rows: Row[] = [];
    for (const student of klass?.students ?? []) {
      const project = store.projects.find((p) => p.studentId === student.id && p.taskId === taskId);
      const sub: Submission | undefined = project ? store.submissionOfProject(project.id) : undefined;
      rows.push({
        studentId: student.id,
        studentName: student.name,
        taskTitle: store.getTask(taskId)?.title ?? '',
        auto: sub?.autoScore ?? 0,
        teacher: sub?.teacherScore ?? null,
        total: sub && sub.teacherScore !== null ? sub.autoScore + sub.teacherScore : null,
        status: sub ? sub.status : 'none',
        errors: sub?.errors ?? [],
        jumps: sub?.jumpFrames.length ?? 0,
      });
    }
    return rows;
  }

  private render(): void {
    const rows = this.collectRows();
    const submitted = rows.filter((r) => r.status !== 'none');
    const reviewed = rows.filter((r) => r.status === 'reviewed');
    const avg = reviewed.length
      ? reviewed.reduce((s, r) => s + (r.total ?? 0), 0) / reviewed.length
      : 0;
    const passRate = reviewed.length
      ? (reviewed.filter((r) => (r.total ?? 0) >= 60).length / reviewed.length) * 100
      : 0;

    const stats = this.shadowRoot!.querySelector('#stats')!;
    clear(stats);
    const stat = (num: string, lab: string) => h('div', { class: 'card stat' }, [h('div', { class: 'num', textContent: num }), h('div', { class: 'lab', textContent: lab })]);
    stats.append(
      stat(String(rows.length), '班级人数'),
      stat(String(submitted.length), '已提交'),
      stat(avg.toFixed(1), '平均总分'),
      stat(`${passRate.toFixed(0)}%`, '及格率（≥60）'),
    );

    // 成绩段分布
    const bands = [
      { lab: '90-100', min: 90, max: 101, color: '#35c98f' },
      { lab: '80-89', min: 80, max: 90, color: '#4f8cff' },
      { lab: '70-79', min: 70, max: 80, color: '#a78bfa' },
      { lab: '60-69', min: 60, max: 70, color: '#f5a623' },
      { lab: '<60', min: 0, max: 60, color: '#ff5d6c' },
    ];
    const distHost = this.shadowRoot!.querySelector('#dist')!;
    clear(distHost);
    const maxCount = Math.max(1, ...bands.map((b) => reviewed.filter((r) => (r.total ?? 0) >= b.min && (r.total ?? 0) < b.max).length));
    bands.forEach((b) => {
      const count = reviewed.filter((r) => (r.total ?? 0) >= b.min && (r.total ?? 0) < b.max).length;
      distHost.appendChild(h('div', { class: 'bar-row' }, [
        h('span', { class: 'lab', textContent: b.lab }),
        h('div', { class: 'bar-track' }, [h('div', { class: 'bar-fill', style: `width:${(count / maxCount) * 100}%;background:${b.color}` })]),
        h('span', { class: 'val', textContent: String(count) }),
      ]));
    });
    if (reviewed.length === 0) distHost.appendChild(h('div', { style: 'color:var(--fg-faint);font-size:12px;padding:12px 0', textContent: '暂无已复核成绩' }));

    // 错题排行
    const errCount = new Map<string, number>();
    for (const r of submitted) r.errors.forEach((e) => errCount.set(e, (errCount.get(e) ?? 0) + 1));
    const errHost = this.shadowRoot!.querySelector('#errors')!;
    clear(errHost);
    const sorted = [...errCount.entries()].sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) {
      errHost.appendChild(h('div', { style: 'color:var(--fg-faint);font-size:12px;padding:12px 0', textContent: '暂无错题标注' }));
    }
    const errMax = Math.max(1, ...sorted.map(([, n]) => n));
    sorted.forEach(([tag, n]) => {
      errHost.appendChild(h('div', { class: 'bar-row' }, [
        h('span', { class: 'lab', style: 'width:96px', textContent: tag }),
        h('div', { class: 'bar-track' }, [h('div', { class: 'bar-fill', style: `width:${(n / errMax) * 100}%;background:#ff5d6c` })]),
        h('span', { class: 'val', textContent: String(n) }),
      ]));
    });

    // 明细表
    const tbody = this.shadowRoot!.querySelector('#tbody')!;
    clear(tbody);
    for (const r of rows) {
      const tr = h('tr');
      tr.append(
        h('td', { textContent: r.studentId }),
        h('td', { textContent: r.studentName }),
        h('td', { textContent: r.taskTitle }),
        h('td', { textContent: r.status === 'none' ? '—' : String(r.auto) }),
        h('td', { textContent: r.teacher === null ? '—' : String(r.teacher) }),
        h('td', { textContent: r.total === null ? '—' : String(r.total) }),
        h('td', {}, [h('span', {
          class: `tag ${r.status === 'reviewed' ? 'good' : r.status === 'submitted' ? 'warn' : ''}`,
          textContent: r.status === 'reviewed' ? '已复核' : r.status === 'submitted' ? '待复核' : '未提交',
        })]),
        h('td', { textContent: r.status === 'none' ? '—' : String(r.jumps) }),
        h('td', {}, r.errors.length ? r.errors.map((e) => h('span', { class: 'err-tag', textContent: e })) : [document.createTextNode('—')]),
      );
      tbody.appendChild(tr);
    }
  }

  private exportCsv(): void {
    const rows = this.collectRows();
    const header = ['学号', '姓名', '任务', '自动评分', '教师评分', '总分', '状态', '跳变帧数', '错题'];
    const lines = rows.map((r) => [
      r.studentId,
      r.studentName,
      r.taskTitle,
      r.status === 'none' ? '' : r.auto,
      r.teacher ?? '',
      r.total ?? '',
      r.status === 'reviewed' ? '已复核' : r.status === 'submitted' ? '待复核' : '未提交',
      r.status === 'none' ? '' : r.jumps,
      r.errors.join('|'),
    ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','));
    const csv = '﻿' + [header.join(','), ...lines].join('\n');
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), '班级成绩汇总.csv');
  }
}
