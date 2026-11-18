import type { Feature, LayerId, Student, Submission, Task } from '../types';
import { LAYER_MAP } from '../types';
import { effectiveScore, submissionTotal, wrongItems } from './grading';

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** 加 UTF-8 BOM,Excel 打开中文不乱码 */
function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function fmtTime(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 全员成绩单汇总导出 */
export function exportTranscript(
  students: Student[],
  submissions: Submission[],
  tasks: Task[],
) {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const rows: (string | number)[][] = [
    ['学员编号', '姓名', '班级', '任务编号', '任务名称', '科目', '提交时间', '状态', '系统初步分', '复核总分', '最终成绩'],
  ];
  for (const stu of students) {
    const mine = submissions.filter((s) => s.student === stu.id).sort((a, b) => a.submittedAt - b.submittedAt);
    if (mine.length === 0) {
      rows.push([stu.id, stu.name, stu.classNo, '', '', '', '', '未提交', '', '', '']);
      continue;
    }
    for (const s of mine) {
      const t = taskMap.get(s.taskId);
      rows.push([
        stu.id,
        stu.name,
        stu.classNo,
        t?.id ?? s.taskId,
        t?.title ?? '',
        t?.subject ?? '',
        fmtTime(s.submittedAt),
        s.reviewed ? '已复核' : '待复核',
        s.autoTotal,
        s.finalTotal ?? '',
        submissionTotal(s),
      ]);
    }
  }
  downloadCsv(`成绩单汇总_${Date.now()}.csv`, rows);
}

/** 单人成绩单 + 错题清单 */
export function exportStudentReport(
  stu: Student,
  submissions: Submission[],
  tasks: Task[],
  features: Map<string, Feature>,
) {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const rows: (string | number)[][] = [];
  rows.push(['学员成绩单与错题清单']);
  rows.push(['学员编号', stu.id, '姓名', stu.name, '班级', stu.classNo]);
  rows.push([]);
  rows.push(['一、成绩单']);
  rows.push(['任务编号', '任务名称', '科目', '提交时间', '状态', '系统初步分', '复核总分', '最终成绩', '教练评语']);
  for (const s of submissions) {
    const t = taskMap.get(s.taskId);
    rows.push([
      t?.id ?? s.taskId,
      t?.title ?? '',
      t?.subject ?? '',
      fmtTime(s.submittedAt),
      s.reviewed ? '已复核' : '待复核',
      s.autoTotal,
      s.finalTotal ?? '',
      submissionTotal(s),
      s.reviewComment,
    ]);
  }
  rows.push([]);
  rows.push(['二、错题清单(偏差 > 0.3m 或缺项)']);
  rows.push(['任务名称', '要素编号', '要素名称', '所属图层', '偏差(m)', '系统得分', '复核得分', '问题说明']);
  for (const s of submissions) {
    const t = taskMap.get(s.taskId);
    for (const w of wrongItems(s)) {
      const f = features.get(w.featureId);
      rows.push([
        t?.title ?? s.taskId,
        w.featureId,
        w.name,
        LAYER_MAP[(f?.layer ?? w.layer) as LayerId].name,
        Number.isFinite(w.deviation) ? w.deviation : '缺项',
        w.autoScore,
        w.finalScore ?? '',
        w.comment,
      ]);
    }
  }
  downloadCsv(`${stu.name}_成绩单与错题清单_${Date.now()}.csv`, rows);
}
