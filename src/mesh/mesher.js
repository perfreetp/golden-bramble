// 体素 → 网格：贪心合并（greedy meshing）+ 按角度阈值 / 最小边长减面

// getVoxel(x,y,z) -> 颜色索引(>=0) 或 -1 表示空
export function greedyMesh(getVoxel, nx, ny, nz) {
  const dims = [nx, ny, nz];
  const positions = [];
  const quads = [];      // 每个元素 [i0,i1,i2,i3]
  const quadColors = []; // 每个四边面的颜色索引
  let mask = new Int32Array(0);

  for (let d = 0; d < 3; d++) {
    const u = (d + 1) % 3;
    const v = (d + 2) % 3;
    const su = dims[u], sv = dims[v];
    if (mask.length < su * sv) mask = new Int32Array(su * sv);
    const x = [0, 0, 0];
    const q = [0, 0, 0];
    q[d] = 1;

    for (x[d] = -1; x[d] < dims[d];) {
      // 1) 构建本切片的面掩码：>0 正向面，<0 反向面，0 无面
      let n = 0;
      for (x[v] = 0; x[v] < sv; x[v]++) {
        for (x[u] = 0; x[u] < su; x[u]++) {
          const a = x[d] >= 0 ? getVoxel(x[0], x[1], x[2]) : -1;
          const b = x[d] < dims[d] - 1 ? getVoxel(x[0] + q[0], x[1] + q[1], x[2] + q[2]) : -1;
          if ((a >= 0) === (b >= 0)) mask[n++] = 0;
          else if (a >= 0) mask[n++] = a + 1;
          else mask[n++] = -(b + 1);
        }
      }
      x[d]++;
      // 2) 贪心合并矩形
      n = 0;
      for (let j = 0; j < sv; j++) {
        for (let i = 0; i < su;) {
          const c = mask[n];
          if (c !== 0) {
            let w = 1;
            while (i + w < su && mask[n + w] === c) w++;
            let h = 1, done = false;
            for (h = 1; j + h < sv; h++) {
              for (let k = 0; k < w; k++) {
                if (mask[n + k + h * su] !== c) { done = true; break; }
              }
              if (done) break;
            }
            x[u] = i; x[v] = j;
            const du = [0, 0, 0]; du[u] = w;
            const dv = [0, 0, 0]; dv[v] = h;
            const base = positions.length / 3;
            positions.push(
              x[0], x[1], x[2],
              x[0] + du[0], x[1] + du[1], x[2] + du[2],
              x[0] + du[0] + dv[0], x[1] + du[1] + dv[1], x[2] + du[2] + dv[2],
              x[0] + dv[0], x[1] + dv[1], x[2] + dv[2]
            );
            if (c > 0) quads.push([base, base + 1, base + 2, base + 3]);
            else quads.push([base, base + 3, base + 2, base + 1]);
            quadColors.push(Math.abs(c) - 1);
            for (let l = 0; l < h; l++)
              for (let k = 0; k < w; k++) mask[n + k + l * su] = 0;
            i += w; n += w;
          } else {
            i++; n++;
          }
        }
      }
    }
  }
  return { positions, quads, quadColors };
}

// ---------- 减面 ----------

function triNormal(p, t) {
  const ax = p[t[0] * 3], ay = p[t[0] * 3 + 1], az = p[t[0] * 3 + 2];
  const ux = p[t[1] * 3] - ax, uy = p[t[1] * 3 + 1] - ay, uz = p[t[1] * 3 + 2] - az;
  const vx = p[t[2] * 3] - ax, vy = p[t[2] * 3 + 1] - ay, vz = p[t[2] * 3 + 2] - az;
  let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const l = Math.hypot(nx, ny, nz) || 1;
  return [nx / l, ny / l, nz / l];
}

function triArea(p, t) {
  const ax = p[t[0] * 3], ay = p[t[0] * 3 + 1], az = p[t[0] * 3 + 2];
  const ux = p[t[1] * 3] - ax, uy = p[t[1] * 3 + 1] - ay, uz = p[t[1] * 3 + 2] - az;
  const vx = p[t[2] * 3] - ax, vy = p[t[2] * 3 + 1] - ay, vz = p[t[2] * 3 + 2] - az;
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  return Math.hypot(nx, ny, nz) / 2;
}

function newellNormal(p, loop) {
  let nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i] * 3, b = loop[(i + 1) % loop.length] * 3;
    nx += (p[a + 1] - p[b + 1]) * (p[a + 2] + p[b + 2]);
    ny += (p[a + 2] - p[b + 2]) * (p[a] + p[b]);
    nz += (p[a] - p[b]) * (p[a + 1] + p[b + 1]);
  }
  const l = Math.hypot(nx, ny, nz) || 1;
  return [nx / l, ny / l, nz / l];
}

// 角度阈值减面：凡所有相邻面法线夹角都不超过阈值的顶点，溶掉该顶点并重新三角化
function planarDissolve(positions, tris, triCol, angleDeg) {
  const cosT = Math.cos((angleDeg * Math.PI) / 180) - 1e-9;
  for (let pass = 0; pass < 10; pass++) {
    const v2t = new Map();
    for (let ti = 0; ti < tris.length; ti++)
      for (const vtx of tris[ti]) {
        let l = v2t.get(vtx);
        if (!l) v2t.set(vtx, (l = []));
        l.push(ti);
      }
    const dead = new Set();
    const additions = [];
    let changed = false;

    for (const [vtx, list] of v2t) {
      const inc = list.filter((ti) => !dead.has(ti));
      if (inc.length < 3) continue;
      const col = triCol[inc[0]];
      if (!inc.every((ti) => triCol[ti] === col)) continue; // 不跨颜色合并
      const ns = inc.map((ti) => triNormal(positions, tris[ti]));
      let ok = true;
      for (let i = 0; i < ns.length && ok; i++)
        for (let j = i + 1; j < ns.length; j++)
          if (ns[i][0] * ns[j][0] + ns[i][1] * ns[j][1] + ns[i][2] * ns[j][2] < cosT) { ok = false; break; }
      if (!ok) continue;
      // 边界环（不含 vtx 的边）
      const adj = new Map();
      const addAdj = (a, b) => {
        let l = adj.get(a);
        if (!l) adj.set(a, (l = []));
        l.push(b);
      };
      let valid = true;
      for (const ti of inc) {
        const others = tris[ti].filter((x) => x !== vtx);
        if (others.length !== 2) { valid = false; break; }
        addAdj(others[0], others[1]);
        addAdj(others[1], others[0]);
      }
      if (!valid) continue;
      if ([...adj.values()].some((l) => l.length !== 2)) continue;
      // 沿环走一圈
      const start = adj.keys().next().value;
      const loop = [start];
      let prev = -1, cur = start;
      while (true) {
        const nxt = adj.get(cur).find((x) => x !== prev);
        if (nxt === start) break;
        if (nxt === undefined || loop.includes(nxt) || loop.length > inc.length + 2) { valid = false; break; }
        loop.push(nxt);
        prev = cur; cur = nxt;
      }
      if (!valid || loop.length !== inc.length) continue;
      // 方向对齐平均法线
      let an = [0, 0, 0];
      for (const n of ns) { an[0] += n[0]; an[1] += n[1]; an[2] += n[2]; }
      const al = Math.hypot(...an) || 1;
      an = [an[0] / al, an[1] / al, an[2] / al];
      const ln = newellNormal(positions, loop);
      if (ln[0] * an[0] + ln[1] * an[1] + ln[2] * an[2] < 0) loop.reverse();
      // 扇形三角化 + 面积校验（凹多边形则放弃）
      let oldArea = 0;
      for (const ti of inc) oldArea += triArea(positions, tris[ti]);
      const fan = [];
      let newArea = 0, fanOk = true;
      for (let i = 1; i < loop.length - 1; i++) {
        const t = [loop[0], loop[i], loop[i + 1]];
        const n = triNormal(positions, t);
        if (n[0] * an[0] + n[1] * an[1] + n[2] * an[2] < 0.5) { fanOk = false; break; }
        newArea += triArea(positions, t);
        fan.push(t);
      }
      if (!fanOk || Math.abs(newArea - oldArea) > oldArea * 0.01 + 1e-6) continue;
      for (const ti of inc) dead.add(ti);
      for (const t of fan) additions.push([t, col]);
      changed = true;
    }
    if (!changed) break;
    tris = tris.filter((_, i) => !dead.has(i));
    triCol = triCol.filter((_, i) => !dead.has(i));
    for (const [t, c] of additions) { tris.push(t); triCol.push(c); }
  }
  return { tris, triCol };
}

// 角度阈值减面（边坍缩）：把边坍缩到中点，若周围面法线变化都不超过阈值则接受。
// 体素网格都是直角，小阈值几乎不动；阈值拉大后尖角被削平、面数下降。
function edgeCollapse(positions, tris, triCol, angleDeg) {
  const cosT = Math.cos(angleDeg * Math.PI / 180) - 1e-9;
  const normAt = (t, mid, ma, mb) => {
    // 三角形 t 在把顶点 ma/mb 替换为 mid 后的法线；退化返回 null
    const p = [];
    for (let i = 0; i < 3; i++) {
      const v = t[i];
      if (v === ma || v === mb) p.push(mid[0], mid[1], mid[2]);
      else p.push(positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]);
    }
    const ux = p[3] - p[0], uy = p[4] - p[1], uz = p[5] - p[2];
    const vx = p[6] - p[0], vy = p[7] - p[1], vz = p[8] - p[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz);
    if (l < 1e-9) return null;
    return [nx / l, ny / l, nz / l];
  };

  for (let pass = 0; pass < 20; pass++) {
    const v2f = new Map();
    const e2f = new Map();
    const ek = (a, b) => (a < b ? a + '_' + b : b + '_' + a);
    tris.forEach((t, ti) => {
      for (const v of t) {
        let l = v2f.get(v);
        if (!l) v2f.set(v, (l = []));
        l.push(ti);
      }
      for (let e = 0; e < 3; e++) {
        const k = ek(t[e], t[(e + 1) % 3]);
        let l = e2f.get(k);
        if (!l) e2f.set(k, (l = []));
        l.push(ti);
      }
    });

    const removed = new Set();
    const redirect = new Map();
    const locked = new Set();
    let changed = false;

    for (const [k, faces] of e2f) {
      if (faces.length !== 2) continue; // 只处理流形边
      if (removed.has(faces[0]) || removed.has(faces[1])) continue;
      const [a, b] = k.split('_').map(Number);
      if (redirect.has(a) || redirect.has(b) || locked.has(a) || locked.has(b)) continue;
      const col = triCol[faces[0]];
      // 受影响的面
      const affected = new Set([...(v2f.get(a) || []), ...(v2f.get(b) || [])]);
      // 坍缩后剩余面数太少会出洞（如孤立四边面）
      if (affected.size - 2 < 3) continue;
      // 不跨颜色坍缩
      let sameCol = true;
      for (const fi of affected) if (triCol[fi] !== col) { sameCol = false; break; }
      if (!sameCol) continue;
      const mid = [
        (positions[a * 3] + positions[b * 3]) / 2,
        (positions[a * 3 + 1] + positions[b * 3 + 1]) / 2,
        (positions[a * 3 + 2] + positions[b * 3 + 2]) / 2,
      ];
      let ok = true;
      for (const fi of affected) {
        if (fi === faces[0] || fi === faces[1]) continue;
        const t = tris[fi];
        const n0 = triNormal(positions, t);
        const n1 = normAt(t, mid, a, b);
        if (!n1 || n0[0] * n1[0] + n0[1] * n1[1] + n0[2] * n1[2] < cosT) { ok = false; break; }
      }
      if (!ok) continue;
      positions[a * 3] = mid[0];
      positions[a * 3 + 1] = mid[1];
      positions[a * 3 + 2] = mid[2];
      removed.add(faces[0]);
      removed.add(faces[1]);
      redirect.set(b, a);
      for (const fi of affected) for (const v of tris[fi]) locked.add(v);
      changed = true;
    }
    if (!changed) break;
    const resolve = (v) => { while (redirect.has(v)) v = redirect.get(v); return v; };
    const nt = [], nc = [];
    tris.forEach((t, ti) => {
      if (removed.has(ti)) return;
      const r = [resolve(t[0]), resolve(t[1]), resolve(t[2])];
      if (r[0] === r[1] || r[1] === r[2] || r[2] === r[0]) return;
      nt.push(r); nc.push(triCol[ti]);
    });
    tris = nt; triCol = nc;
  }
  return { tris, triCol };
}

// 最小边长减面：短于阈值的边做顶点焊接，退化面剔除
function weldShortEdges(positions, tris, triCol, minLen) {
  const min2 = minLen * minLen;
  const nv = positions.length / 3;
  for (let pass = 0; pass < 4; pass++) {
    const parent = new Int32Array(nv);
    for (let i = 0; i < nv; i++) parent[i] = i;
    const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
    const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[rb] = ra; };
    let changed = false;
    for (const t of tris) {
      for (let e = 0; e < 3; e++) {
        const a = t[e], b = t[(e + 1) % 3];
        const dx = positions[a * 3] - positions[b * 3];
        const dy = positions[a * 3 + 1] - positions[b * 3 + 1];
        const dz = positions[a * 3 + 2] - positions[b * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < min2) { union(a, b); changed = true; }
      }
    }
    if (!changed) break;
    const nt = [], nc = [];
    for (let ti = 0; ti < tris.length; ti++) {
      const t = tris[ti].map(find);
      if (t[0] === t[1] || t[1] === t[2] || t[2] === t[0]) continue;
      nt.push(t); nc.push(triCol[ti]);
    }
    if (nt.length === tris.length) break;
    tris = nt; triCol = nc;
  }
  return { tris, triCol };
}

// 按坐标焊接重复顶点（贪心合并的每个四边面顶点独立，先焊成流形网格再减面）
function weldByPosition(positions, quads) {
  const map = new Map();
  const remap = [];
  const out = [];
  for (let i = 0; i < positions.length / 3; i++) {
    const k = positions[i * 3] + ',' + positions[i * 3 + 1] + ',' + positions[i * 3 + 2];
    let idx = map.get(k);
    if (idx === undefined) {
      idx = out.length / 3;
      map.set(k, idx);
      out.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
    }
    remap.push(idx);
  }
  return { positions: out, quads: quads.map((q) => q.map((v) => remap[v])) };
}

// 减面入口：quads -> 顶点焊接 -> 三角化 -> 角度阈值（溶点 + 边坍缩）-> 最小边长焊接
// minEdgeCells 为换算成体素单位的最小边长
export function decimate(positions, quads, quadColors, angleDeg, minEdgeCells) {
  ({ positions, quads } = weldByPosition(positions, quads));
  let tris = [];
  let triCol = [];
  quads.forEach((q, i) => {
    tris.push([q[0], q[1], q[2]]);
    tris.push([q[0], q[2], q[3]]);
    triCol.push(quadColors[i], quadColors[i]);
  });
  if (angleDeg > 0) {
    ({ tris, triCol } = planarDissolve(positions, tris, triCol, angleDeg));
    ({ tris, triCol } = edgeCollapse(positions, tris, triCol, angleDeg));
  }
  if (minEdgeCells > 0) ({ tris, triCol } = weldShortEdges(positions, tris, triCol, minEdgeCells));
  return { positions, tris, triColors: triCol };
}
