/* ============================================================
 * geometry.js — 贝塞尔路径几何
 *  d 字符串生成 / 三次贝塞尔采样 / 节点插入 / 断开闭合 /
 *  环向环绕切分 / 吸附引擎 / 接缝校验
 * ============================================================ */
(function () {
  const App = window.App;
  const r3 = App.round3;

  /* ---------------- d 字符串 ---------------- */
  function pathD(p) {
    const n = p.nodes;
    if (!n.length) return '';
    let d = `M ${r3(n[0].x)} ${r3(n[0].y)}`;
    for (let i = 1; i < n.length; i++) {
      const prev = n[i - 1], cur = n[i];
      if (cur.c1 && prev.c2) {
        d += ` C ${r3(prev.x + prev.c2.dx)} ${r3(prev.y + prev.c2.dy)}`
           + ` ${r3(cur.x + cur.c1.dx)} ${r3(cur.y + cur.c1.dy)}`
           + ` ${r3(cur.x)} ${r3(cur.y)}`;
      } else {
        d += ` L ${r3(cur.x)} ${r3(cur.y)}`;
      }
    }
    if (p.closed && n.length > 2) {
      const last = n[n.length - 1], first = n[0];
      if (first.c1 && last.c2) {
        d += ` C ${r3(last.x + last.c2.dx)} ${r3(last.y + last.c2.dy)}`
           + ` ${r3(first.x + first.c1.dx)} ${r3(first.y + first.c1.dy)}`
           + ` ${r3(first.x)} ${r3(first.y)}`;
      }
      d += ' Z';
    }
    return d;
  }
  App.pathD = pathD;

  /* ---------------- 三次贝塞尔采样 ---------------- */
  function cubicPoints(p0, p1, p2, p3, steps) {
    const out = [];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, mt = 1 - t;
      const a = mt * mt * mt, b = 3 * mt * mt * t, c = 3 * mt * t * t, dd = t * t * t;
      out.push({
        x: a * p0.x + b * p1.x + c * p2.x + dd * p3.x,
        y: a * p0.y + b * p1.y + c * p2.y + dd * p3.y
      });
    }
    return out;
  }

  // 把整条路径（含闭合段）展开为折线采样点，stepMm 为目标采样间距
  function flatten(p, stepMm = 0.15) {
    const n = p.nodes;
    if (!n.length) return [];
    const pts = [{ x: n[0].x, y: n[0].y, nodeIndex: 0 }];
    const segCount = n.length - 1 + (p.closed && n.length > 2 ? 1 : 0);
    for (let s = 0; s < segCount; s++) {
      const a = n[s];
      const b = n[(s + 1) % n.length];
      let segPts;
      if (b.c1 && a.c2) {
        const p0 = { x: a.x, y: a.y };
        const p1 = { x: a.x + a.c2.dx, y: a.y + a.c2.dy };
        const p2 = { x: b.x + b.c1.dx, y: b.y + b.c1.dy };
        const p3 = { x: b.x, y: b.y };
        const approxLen = Math.hypot(p3.x - p0.x, p3.y - p0.y)
          + (Math.hypot(p1.x - p0.x, p1.y - p0.y) + Math.hypot(p2.x - p1.x, p2.y - p1.y)
             + Math.hypot(p3.x - p2.x, p3.y - p2.y)) / 2;
        const steps = Math.max(2, Math.ceil(approxLen / stepMm));
        segPts = cubicPoints(p0, p1, p2, p3, steps);
      } else {
        // 直线段同样按 stepMm 插值，保证窄缝扫描有足够采样点
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        const steps = Math.max(1, Math.ceil(len / stepMm));
        segPts = [];
        for (let k = 1; k <= steps; k++) {
          const t = k / steps;
          segPts.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
        }
      }
      segPts.forEach(pt => pts.push({ x: pt.x, y: pt.y, nodeIndex: (s + 1) % n.length }));
    }
    return pts;
  }
  App.flatten = flatten;

  /* ---------------- 在指定线段 t 处插入节点 ---------------- */
  function splitCubic(p0, p1, p2, p3, t) {
    const p01 = lerp(p0, p1, t), p12 = lerp(p1, p2, t), p23 = lerp(p2, p3, t);
    const p012 = lerp(p01, p12, t), p123 = lerp(p12, p23, t);
    const p0123 = lerp(p012, p123, t);
    return { left: [p0, p01, p012, p0123], right: [p0123, p123, p23, p3] };
  }
  function lerp(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }

  // 在路径上离 point 最近的位置插入节点，返回新节点索引
  App.insertNodeNear = function (p, point) {
    const n = p.nodes;
    let best = null;
    const segCount = n.length - 1 + (p.closed && n.length > 2 ? 1 : 0);
    for (let s = 0; s < segCount; s++) {
      const a = n[s], b = n[(s + 1) % n.length];
      if (b.c1 && a.c2) {
        const p0 = { x: a.x, y: a.y }, p1 = { x: a.x + a.c2.dx, y: a.y + a.c2.dy };
        const p2 = { x: b.x + b.c1.dx, y: b.y + b.c1.dy }, p3 = { x: b.x, y: b.y };
        const steps = 24;
        const pts = cubicPoints(p0, p1, p2, p3, steps);
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const pt = pts[i - 1];
          const d = Math.hypot(pt.x - point.x, pt.y - point.y);
          if (!best || d < best.d) best = { d, s, t, p0, p1, p2, p3 };
        }
      } else {
        const t = projT({ x: a.x, y: a.y }, { x: b.x, y: b.y }, point);
        const pt = lerp({ x: a.x, y: a.y }, { x: b.x, y: b.y }, t);
        const d = Math.hypot(pt.x - point.x, pt.y - point.y);
        if (!best || d < best.d) best = { d, s, t, linear: true };
      }
    }
    if (!best) return null;
    const insertAt = best.s + 1;
    let newNode, patchA, patchB;
    if (best.linear) {
      const a = n[best.s], b = n[(best.s + 1) % n.length];
      const pt = lerp({ x: a.x, y: a.y }, { x: b.x, y: b.y }, best.t);
      newNode = App.makeNode(pt.x, pt.y);
      patchA = { c2: null }; patchB = { c1: null };
    } else {
      const { left, right } = splitCubic(best.p0, best.p1, best.p2, best.p3, best.t);
      const a = n[best.s], b = n[(best.s + 1) % n.length];
      newNode = App.makeNode(left[3].x, left[3].y,
        { dx: left[2].x - left[3].x, dy: left[2].y - left[3].y },
        { dx: right[1].x - right[0].x, dy: right[1].y - right[0].y });
      patchA = { c2: { dx: left[1].x - left[0].x, dy: left[1].y - left[0].y } };
      patchB = { c1: { dx: right[2].x - right[3].x, dy: right[2].y - right[3].y } };
    }
    p.nodes.splice(insertAt, 0, newNode);
    const nodeA = p.nodes[best.s];
    nodeA.c2 = patchA.c2;
    const nodeB = p.nodes[(insertAt + 1) % p.nodes.length];
    nodeB.c1 = patchB.c1;
    return insertAt;
  };

  function projT(a, b, p) {
    const vx = b.x - a.x, vy = b.y - a.y;
    const L2 = vx * vx + vy * vy;
    if (L2 < 1e-9) return 0;
    return Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / L2));
  }

  /* ---------------- 断开 / 闭合 ---------------- */
  // 在 nodeIndex 处断开：闭合路径直接打开（该点成为新起点）；开放路径切成两条
  App.breakAtNode = function (p, nodeIndex) {
    const n = p.nodes;
    if (n.length < 2) return null;
    if (p.closed) {
      p.closed = false;
      if (nodeIndex > 0) {
        const moved = n.splice(0, nodeIndex);
        p.nodes = n.concat(moved);
      }
      // 打开后切断接缝两侧控制柄
      p.nodes[0].c1 = null;
      p.nodes[p.nodes.length - 1].c2 = null;
      return [p];
    }
    const part1 = n.slice(0, nodeIndex + 1).map(cloneNode);
    const part2 = n.slice(nodeIndex).map(cloneNode);
    part1[part1.length - 1].c2 = null;
    part2[0].c1 = null;
    const p1 = App.makePath(p.name + '-断1', part1, { layerId: p.layerId, color: p.color, fill: p.fill });
    const p2 = App.makePath(p.name + '-断2', part2, { layerId: p.layerId, color: p.color, fill: p.fill });
    return [p1, p2];
  };

  App.closeOpenPath = function (p) {
    if (p.closed || p.nodes.length < 3) return false;
    p.closed = true;
    return true;
  };

  function cloneNode(nd) {
    return App.makeNode(nd.x, nd.y, nd.c1 ? { ...nd.c1 } : null, nd.c2 ? { ...nd.c2 } : null);
  }
  App.cloneNode = cloneNode;

  /* ---------------- 环向环绕：平移 + 跨接缝切分 ---------------- */
  function cubicAt(p0, p1, p2, p3, t) {
    const mt = 1 - t;
    const a = mt * mt * mt, b = 3 * mt * mt * t, c = 3 * mt * t * t, dd = t * t * t;
    return {
      x: a * p0.x + b * p1.x + c * p2.x + dd * p3.x,
      y: a * p0.y + b * p1.y + c * p2.y + dd * p3.y
    };
  }

  // 对单条三次贝塞尔做保形切分；depth 防止共线边界递归不收敛
  function splitCubicAtX(p0, p1, p2, p3, xCut, depth = 0) {
    const crosses = (p0.x - xCut) * (p3.x - xCut) < 0;
    if (!crosses) return null;
    if (depth > 12) {
      return { t: 0.5, at: cubicAt(p0, p1, p2, p3, 0.5) };
    }
    let lo = 0, hi = 1;
    for (let k = 0; k < 30; k++) {
      const mid = (lo + hi) / 2;
      const x = cubicAt(p0, p1, p2, p3, mid).x;
      if ((x - xCut) * (p0.x - xCut) < 0) hi = mid; else lo = mid;
    }
    const t = (lo + hi) / 2;
    const { left, right } = splitCubic(p0, p1, p2, p3, t);
    return { t, at: left[3], left, right };
  }

  /* ---------------- 环向环绕：平移 + 跨接缝切分 ----------------
   * 两段式：① 平移后，把所有跨越 0/W 接缝的段在边界处切开（保贝塞尔形）
   *        ② 节点坐标回绕到 [0,W)，按回绕跳变把开放路径拆成若干子路径；
   *           闭合路径同样拆成各自闭合的子路径，保证三份首尾相接。 */
  App.offsetWrapped = function (p, dx, W, suffix) {
    // ① 平移
    let work = {
      closed: p.closed,
      nodes: p.nodes.map(nd => App.makeNode(
        nd.x + dx, nd.y,
        nd.c1 ? { dx: nd.c1.dx, dy: nd.c1.dy } : null,
        nd.c2 ? { dx: nd.c2.dx, dy: nd.c2.dy } : null
      ))
    };

    // 在所有跨边界段上反复切分，直到不再有跨缝段
    let guard = 0;
    while (guard++ < 200) {
      const n = work.nodes;
      const segCount = n.length - 1 + (work.closed && n.length > 2 ? 1 : 0);
      let cross = null;
      for (let s = 0; s < segCount && !cross; s++) {
        const a = n[s], b = n[(s + 1) % n.length];
        const p0 = { x: a.x, y: a.y }, p3 = { x: b.x, y: b.y };
        if (p0.x * p3.x < 0 || (p0.x - W) * (p3.x - W) < 0) {
          const xCut = p0.x * p3.x < 0 ? 0 : W;
          if (b.c1 && a.c2) {
            const p1 = { x: a.x + a.c2.dx, y: a.y + a.c2.dy };
            const p2 = { x: b.x + b.c1.dx, y: b.y + b.c1.dy };
            const res = splitCubicAtX(p0, p1, p2, p3, xCut);
            if (res) cross = { s, xCut, ...res };
          } else {
            const t = projT(p0, p3, { x: xCut, y: p0.y });
            cross = { s, xCut, t, at: lerp(p0, p3, t), linear: true };
          }
        }
      }
      if (!cross) break;

      const n2 = work.nodes;
      const insertAt = cross.s + 1;
      let midNode;
      if (cross.linear) {
        midNode = App.makeNode(cross.at.x, cross.at.y);
      } else {
        midNode = App.makeNode(cross.at.x, cross.at.y,
          { dx: cross.left[2].x - cross.left[3].x, dy: cross.left[2].y - cross.left[3].y },
          { dx: cross.right[1].x - cross.right[0].x, dy: cross.right[1].y - cross.right[0].y });
      }
      n2.splice(insertAt, 0, midNode);
      n2[cross.s].c2 = cross.linear ? null
        : { dx: cross.left[1].x - cross.left[0].x, dy: cross.left[1].y - cross.left[0].y };
      n2[insertAt + 1].c1 = cross.linear ? null
        : { dx: cross.right[2].x - cross.right[3].x, dy: cross.right[2].y - cross.right[3].y };
    }

    // ② 坐标回绕到 [0,W)；后续按相邻节点的回绕跳变拆子路径
    work.nodes.forEach(nd => {
      while (nd.x < 0) nd.x = r3(nd.x + W);
      while (nd.x >= W) nd.x = r3(nd.x - W);
    });

    let subNodeGroups;
    if (!work.closed) {
      // 相邻节点出现“回绕跳变”即断开为新子路径
      subNodeGroups = [];
      let cur = [work.nodes[0]];
      for (let i = 1; i < work.nodes.length; i++) {
        const jump = Math.abs(work.nodes[i].x - work.nodes[i - 1].x) > W / 2;
        if (jump) { subNodeGroups.push(cur); cur = []; }
        cur.push(work.nodes[i]);
      }
      subNodeGroups.push(cur);
    } else {
      subNodeGroups = closedSubpaths(work.nodes, W);
    }

    // ③ 清理切分产生的重复共点（切分点与回绕点坐标重合），避免接缝端点虚高
    subNodeGroups = subNodeGroups.map(mergeCoincident);

    return subNodeGroups.filter(g => g.length > 1).map((g, i) => {
      const np = App.makePath(
        p.name + suffix + (subNodeGroups.length > 1 ? '-' + (i + 1) : ''),
        g.map(cloneNode), {
          layerId: p.layerId, color: p.color, fill: p.fill,
          closed: work.closed, wrap: subNodeGroups.length > 1
        });
      return np;
    });
  };

  // 融合一条子路径上坐标重合（切分残差 <0.1mm）的相邻节点
  function mergeCoincident(nodes) {
    const out = [];
    nodes.forEach(nd => {
      const prev = out[out.length - 1];
      if (prev && Math.hypot(prev.x - nd.x, prev.y - nd.y) < 0.1) {
        // 合并到 prev：保留位置，切断两者间的控制柄
        prev.c2 = null;
        nd.c1 = null;
      } else {
        out.push(nd);
      }
    });
    return out;
  }

  // 闭合路径在接缝处切开后，按回绕跳变重建为多条各自闭合的子路径
  function closedSubpaths(nodes, W) {
    const groups = [];
    let cur = [nodes[0]];
    const n = nodes.length;
    for (let i = 1; i < n; i++) {
      const jump = Math.abs(nodes[i].x - nodes[i - 1].x) > W / 2;
      if (jump) { groups.push(cur); cur = []; }
      cur.push(nodes[i]);
    }
    // 末段回到首节点的闭合边
    const jumpClose = Math.abs(nodes[0].x - nodes[n - 1].x) > W / 2;
    if (jumpClose) groups.push(cur);
    else if (groups.length) groups[0] = cur.concat(groups[0]);
    else groups.push(cur);
    return groups;
  }

  /* ---------------- 吸附引擎 ---------------- */
  // candidates: 网格点 / 中心线 / 其它路径端点；返回最近候选或 null
  App.snap = function (pos, ctx) {
    const { doc, paths, activePath, tolerance, gridOn, centerOn, endpointOn } = ctx;
    let best = null;
    const consider = (x, y, label) => {
      const d = Math.hypot(x - pos.x, y - pos.y);
      if (d <= tolerance && (!best || d < best.d)) best = { x: r3(x), y: r3(y), d, label };
    };
    if (gridOn) {
      const gx = Math.round(pos.x / doc.gridMm) * doc.gridMm;
      const gy = Math.round(pos.y / doc.gridMm) * doc.gridMm;
      consider(gx, gy, '网格');
    }
    if (centerOn) consider(pos.x, doc.heightMm / 2, '中心线');
    if (endpointOn) {
      paths.forEach(p => {
        if (!p.visible || p === activePath) return;
        p.nodes.forEach((nd, i) => {
          if (!p.closed && (i === 0 || i === p.nodes.length - 1)) {
            consider(nd.x, nd.y, '端点:' + p.name);
          }
        });
      });
    }
    return best;
  };

  /* ---------------- 环向接缝校验 ----------------
   * 环向阵列（含跨缝切分）后，落在左接缝 x≈0 与右接缝 x≈W 的端点，
   * 在物理笔杆上本是同一点。按 y 坐标做全局就近配对（切分后两侧
   * 属于不同子路径，不能再要求同路径），y 偏差即首尾错位量。
   * 容差：配对 0.6mm，判定对齐 0.2mm。 */
  App.seamCheck = function (paths, W) {
    const tol = 0.6;          // 左右接缝端点的配对容差
    const dedup = 0.1;        // 同接缝切分残差点的去重容差
    const collect = (isLeft) => {
      const ys = [];
      paths.forEach(p => {
        if (p.closed) return;
        p.nodes.forEach(nd => {
          const onSeam = isLeft ? nd.x <= tol : W - nd.x <= tol;
          if (onSeam) ys.push(nd.y);
        });
      });
      // 贪心聚类：排序后把落在 dedup 内的切分残差点融合为一个代表 y
      ys.sort((a, b) => a - b);
      const clusters = [];
      ys.forEach(y => {
        const last = clusters[clusters.length - 1];
        if (last && Math.abs(y - last.value) < dedup) last.value = (last.value + y) / 2;
        else clusters.push({ value: y });
      });
      return clusters.map(c => c.value);
    };
    const leftY = collect(true), rightY = collect(false);
    if (!leftY.length && !rightY.length) return [];
    // 贪心最近邻配对：枚举所有左右组合，按 y 偏差从小到大依次配对，
    // 避免排序下标配对在副本环向移位后错位
    const cand = [];
    leftY.forEach(ly => rightY.forEach(ry =>
      cand.push({ ly, ry, dy: Math.abs(ly - ry) })));
    cand.sort((a, b) => a.dy - b.dy);
    const usedL = new Set(), usedR = new Set();
    const pairs = [];
    cand.forEach(c => {
      const li = leftY.indexOf(c.ly), ri = rightY.indexOf(c.ry);
      if (usedL.has(li) || usedR.has(ri)) return;
      usedL.add(li); usedR.add(ri);
      pairs.push(c);
    });
    const report = pairs.map((c, i) =>
      ({ name: `接缝点 ${i + 1}`, dy: App.round3(c.dy), ok: c.dy <= 0.2 }));
    if (leftY.length !== rightY.length) {
      report.push({
        name: '接缝端点数量不平衡', dy: 999, ok: true,
        detail: `左 ${leftY.length} / 右 ${rightY.length}，含落在接缝母线上的端点，请目检首尾`
      });
    }
    return report;
  };
})();
