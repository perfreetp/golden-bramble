// 料单汇总：按 分区 + 规格 + 纹样 + 设色 聚合，支持导出 CSV
import { COLOR_GRADES, MOTIF_LABELS, ZONES } from './constants.js';

export function buildBOM(pieces, orderColorGrade) {
  const rows = new Map();
  for (const pc of pieces) {
    const spec = pc.isTrim
      ? `收边 ${Math.round(pc.w)}×${Math.round(pc.h)}`
      : pc.shape === 'triangle'
        ? `三角 ${Math.round(pc.w)}直边`
        : `${Math.round(pc.specW ?? pc.w)}×${Math.round(pc.specH ?? pc.h)}`;
    const color = pc.colorGrade ?? orderColorGrade;
    const paramKey = JSON.stringify(pc.motifParams ?? {});
    const key = [pc.zoneKey, spec, pc.motifKey, paramKey, color].join('|');
    if (!rows.has(key)) {
      rows.set(key, {
        key,
        zone: ZONES[pc.zoneKey]?.name ?? pc.zoneKey,
        motif: MOTIF_LABELS[pc.motifKey] ?? pc.motifKey,
        spec,
        colorGrade: color,
        colorLabel: COLOR_GRADES[color]?.label ?? `等级${color}`,
        count: 0,
        areaM2: 0,
        codes: [],
        trim: pc.isTrim,
      });
    }
    const row = rows.get(key);
    row.count += 1;
    row.areaM2 += (pc.w * pc.h * (pc.shape === 'triangle' ? 0.5 : 1)) / 1e6;
    row.codes.push(pc.code);
  }
  const list = [...rows.values()].sort((a, b) =>
    a.zone.localeCompare(b.zone, 'zh') || a.spec.localeCompare(b.spec));
  for (const r of list) r.areaM2 = Math.round(r.areaM2 * 1000) / 1000;
  return list;
}

export function bomToCSV(rows, order) {
  const header = ['序号', '分区', '规格(mm)', '纹样', '设色', '数量', '面积(m²)', '构件编号'];
  const lines = [header.join(',')];
  rows.forEach((r, i) => {
    lines.push([
      i + 1,
      r.zone,
      r.spec,
      r.motif,
      r.colorLabel,
      r.count,
      r.areaM2,
      `"${r.codes.join(' ')}"`,
    ].join(','));
  });
  const total = rows.reduce((s, r) => s + r.count, 0);
  lines.push(['', '合计', '', '', '', total, rows.reduce((s, r) => s + r.areaM2, 0).toFixed(3), ''].join(','));
  // 加 BOM 头，Excel 打开中文不乱码
  return '﻿' + lines.join('\r\n');
}

// 师傅看板统计
export function buildDashboard(orders) {
  const byMaster = new Map();
  for (const o of orders) {
    if (!o.master) continue;
    if (!byMaster.has(o.master)) {
      byMaster.set(o.master, { master: o.master, done: 0, inProgress: 0, rework: 0, submitted: 0, total: 0 });
    }
    const s = byMaster.get(o.master);
    s.total += 1;
    if (o.status === 'passed') s.done += 1;
    if (['assigned', 'in_progress', 'returned'].includes(o.status)) s.inProgress += 1;
    if (o.status === 'submitted') s.submitted += 1;
    s.rework += o.reworkCount ?? 0;
  }
  return [...byMaster.values()].map((s) => ({
    ...s,
    reworkRate: s.done + s.submitted + s.rework
      ? Math.round((s.rework / (s.done + s.submitted + s.rework)) * 1000) / 10
      : 0,
  }));
}
