import type { FieldState, ObstacleUnit, Submission } from './types';
import { UNIT_LABELS } from './types';
import { unitChannelWidth, unitIncline, unitObstacleHeight } from './evaluation';

function csvCell(v: unknown): string {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** 场地参数表 CSV（给参赛队） */
export function fieldParamsCsv(field: FieldState): string {
  const header = [
    '单元编号', '类型', '中心X(mm)', '中心Z(mm)', '旋转角(°)',
    '占地宽W(mm)', '占地深D(mm)', '高度H(mm)', '坡度(°)',
    '障碍高度(mm)', '通道宽度(mm)', '锁定', '详细参数',
  ];
  const rows = field.units.map((u: ObstacleUnit) => [
    u.id,
    UNIT_LABELS[u.type],
    Math.round(u.position.x),
    Math.round(u.position.z),
    Math.round(u.rotation),
    Math.round(u.size.w),
    Math.round(u.size.d),
    Math.round(u.size.h),
    unitIncline(u),
    unitObstacleHeight(u),
    Math.round(unitChannelWidth(u)),
    u.locked ? '是' : '否',
    JSON.stringify(u.params),
  ]);
  const meta = [
    ['# 场地参数表'],
    ['# 种子', field.config.seed],
    ['# 场地长(mm)', field.config.length],
    ['# 场地宽(mm)', field.config.width],
    ['# 难度系数', field.config.difficulty],
    ['# 障碍序列', field.config.sequence.map((t) => UNIT_LABELS[t]).join('→')],
    [],
  ];
  return [...meta, header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
}

/** 成绩与错题汇总表 CSV */
export function gradeBookCsv(submissions: Submission[]): string {
  const header = [
    '提交编号', '题目', '参赛队', '学员', '提交时间',
    '自动得分(70)', '通过项', '总检查项', '复核得分(30)',
    '总分(100)', '复核时间', '错题汇总', '教师评语',
  ];
  const rows = submissions.map((s) => {
    const fails = s.evaluation.checks.filter((c) => !c.passed).map((c) => c.detail).join('；');
    const total = s.reviewScore === null ? '' : String(s.evaluation.autoScore + s.reviewScore);
    return [
      s.id,
      s.problemId,
      s.teamName,
      s.studentName,
      new Date(s.createdAt).toLocaleString('zh-CN'),
      s.evaluation.autoScore,
      s.evaluation.passedCount,
      s.evaluation.totalCount,
      s.reviewScore ?? '',
      total,
      s.reviewedAt ? new Date(s.reviewedAt).toLocaleString('zh-CN') : '',
      fails,
      s.reviewComment,
    ];
  });
  return [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
}

export function downloadText(filename: string, text: string, mime = 'text/csv;charset=utf-8'): void {
  const blob = new Blob(['﻿' + text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
