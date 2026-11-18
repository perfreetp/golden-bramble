/* ============================================================
 * gaps.js — 窄缝检测
 * 将所有可见路径展开为密集折线采样点（步长 0.1mm），
 * 用空间哈希网格做近邻搜索，找出间距 < 0.3mm 的点对并聚类成标记。
 *
 * 同路径点对的两类“看起来近但不是缝”的情况需排除：
 *   ① 折线相邻采样点（弧长序号差小，间距只是采样步长）；
 *   ② 同一尖角节点两侧、沿不同边走出的点——直线距离近，但折线上
 *      只隔着这一个尖角节点（用两端所属节点索引判定）。
 * 回弯内侧等真正的同路径窄缝，两点之间隔着多个节点，不会被排除。
 * 跨路径点对一律视为合法窄缝来源。近似算法，投产前可用刀路仿真复核。
 * ============================================================ */
(function () {
  const App = window.App;
  const SAMPLE_MM = 0.1;
  // 单元格边长取阈值本身：任意间距 < 阈值的两点，网格坐标之差不超过 1 格，
  // 8 邻域（±1 格）必能覆盖；候选偏多时由后续精确欧氏距离把关，不会误报
  const CELL_MM = 0.3;
  const NEIGHBOR_INDEX_GAP = 2;     // 弧长序号差 ≤ 此值视为折线相邻点
  const COINCIDENT_MM = 0.05;       // 小于该距离视为重合/共线或尖角采样邻点（半个采样步长）

  App.detectGaps = function (paths, limitMm = App.GAP_LIMIT_MM) {
    // 每条路径单独编号采样点，并记录每个采样点前后最近的真实节点索引
    const pts = [];
    paths.forEach(p => {
      if (!p.visible) return;
      const flat = App.flatten(p, SAMPLE_MM);
      let idx = 0;
      for (let i = 0; i < flat.length - 1; i++) {
        const a = flat[i], b = flat[i + 1];
        // 跳过环向接缝处的回绕连线，接缝两侧序号断开
        if (Math.abs(a.x - b.x) > 5) { idx += NEIGHBOR_INDEX_GAP + 1; continue; }
        pts.push({ x: a.x, y: a.y, idx: idx++, pathId: p.id, nodeIndex: a.nodeIndex });
        pts.push({ x: b.x, y: b.y, idx: idx, pathId: p.id, nodeIndex: b.nodeIndex });
      }
    });
    if (pts.length < 4) return { markers: [], minGap: null };

    const grid = new Map();
    const key = (cx, cy) => cx + ',' + cy;
    pts.forEach(pt => {
      const cx = Math.floor(pt.x / CELL_MM), cy = Math.floor(pt.y / CELL_MM);
      const k = key(cx, cy);
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(pt);
    });

    // 同路径两点是否夹着恰好一个尖角节点（分处同一节点的两条邻边）。
    // 闭合路径首尾节点相邻，需按节点数做环形取模。
    const straddlesOneCorner = (path, p, q) => {
      const n = path.nodes.length;
      let diff = Math.abs(p.nodeIndex - q.nodeIndex);
      if (path.closed) diff = Math.min(diff, n - diff);
      return diff <= 1;
    };

    const pathById = new Map(paths.map(p => [p.id, p]));
    const pairs = [];
    const seen = new Set();
    for (const pt of pts) {
      const cx = Math.floor(pt.x / CELL_MM), cy = Math.floor(pt.y / CELL_MM);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const bucket = grid.get(key(cx + dx, cy + dy));
          if (!bucket) continue;
          for (const q of bucket) {
            if (q === pt) continue;
            if (q.pathId === pt.pathId) {
              // ① 折线相邻采样点
              if (Math.abs(q.idx - pt.idx) <= NEIGHBOR_INDEX_GAP) continue;
              // ② 分处同一尖角节点两条邻边上的点（含 paper 微曲线采样、闭合路径首尾尖角）
              if (straddlesOneCorner(pathById.get(pt.pathId), pt, q)) continue;
            }
            const pairKey = pt.pathId < q.pathId ||
              (pt.pathId === q.pathId && pt.idx < q.idx)
              ? `${pt.pathId}:${pt.idx}:${q.pathId}:${q.idx}`
              : `${q.pathId}:${q.idx}:${pt.pathId}:${pt.idx}`;
            if (seen.has(pairKey)) continue;
            const d = Math.hypot(pt.x - q.x, pt.y - q.y);
            if (d < COINCIDENT_MM) continue;   // 重合/共线退化点对
            if (d < limitMm) {
              seen.add(pairKey);
              pairs.push({ x1: pt.x, y1: pt.y, x2: q.x, y2: q.y, d, p1: pt.pathId, p2: q.pathId });
            }
          }
        }
      }
    }

    // 聚类：中点相互靠近的点对合并为一个标记
    const markers = [];
    pairs.sort((a, b) => a.d - b.d);
    for (const pr of pairs) {
      const mx = (pr.x1 + pr.x2) / 2, my = (pr.y1 + pr.y2) / 2;
      const hit = markers.find(mk => Math.hypot(mk.cx - mx, mk.cy - my) < 1.2);
      if (hit) {
        if (pr.d < hit.d) Object.assign(hit, pr, { cx: mx, cy: my, d: pr.d });
      } else {
        markers.push({ ...pr, cx: mx, cy: my });
      }
    }
    const minGap = pairs.length ? pairs[0].d : null;
    return { markers: markers.slice(0, 200), minGap };
  };
})();
