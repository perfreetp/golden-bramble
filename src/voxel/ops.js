// 体素数据操作：增删改、镜像、选区、整体变换
export const key = (x, y, z) => x + ',' + y + ',' + z;
export const parseKey = (k) => k.split(',').map(Number);

export function getVoxel(model, x, y, z) {
  if (x < 0 || y < 0 || z < 0 || x >= model.nx || y >= model.ny || z >= model.nz) return undefined;
  return model.voxels.get(key(x, y, z));
}

// 按 X / Y 镜像开关，把一个坐标扩展成 1/2/4 个对称坐标
export function mirroredCoords(model, x, y, z, mx, my) {
  const out = [[x, y, z]];
  if (mx) out.push([model.nx - 1 - x, y, z]);
  if (my) out.push([x, model.ny - 1 - y, z]);
  if (mx && my) out.push([model.nx - 1 - x, model.ny - 1 - y, z]);
  return out;
}

// 画笔编辑（加 / 减 / 上色），自动套用镜像
export function applyEdit(model, x, y, z, mode, color, mx, my) {
  for (const [cx, cy, cz] of mirroredCoords(model, x, y, z, mx, my)) {
    if (cx < 0 || cy < 0 || cz < 0 || cx >= model.nx || cy >= model.ny || cz >= model.nz) continue;
    const k = key(cx, cy, cz);
    if (mode === 'add') {
      if (!model.voxels.has(k)) model.voxels.set(k, color);
    } else if (mode === 'subtract') {
      model.voxels.delete(k);
    } else if (mode === 'paint') {
      if (model.voxels.has(k)) model.voxels.set(k, color);
    }
  }
}

// ---------- 选区 ----------
export function copyRegion(model, sel) {
  const cells = [];
  for (let z = sel.z0; z <= sel.z1; z++)
    for (let y = sel.y0; y <= sel.y1; y++)
      for (let x = sel.x0; x <= sel.x1; x++) {
        const c = getVoxel(model, x, y, z);
        if (c !== undefined) cells.push({ x: x - sel.x0, y: y - sel.y0, z: z - sel.z0, c });
      }
  return { w: sel.x1 - sel.x0 + 1, h: sel.y1 - sel.y0 + 1, d: sel.z1 - sel.z0 + 1, cells };
}

export function clearRegion(model, sel) {
  for (let z = sel.z0; z <= sel.z1; z++)
    for (let y = sel.y0; y <= sel.y1; y++)
      for (let x = sel.x0; x <= sel.x1; x++)
        model.voxels.delete(key(x, y, z));
}

// 粘贴落点演算：返回每个落点格 + 是否冲突（越界或占用），并套用镜像
export function pastePlacements(model, clip, anchor, mx, my) {
  const placements = [];
  const seen = new Set();
  let hasConflict = false;
  for (const cell of clip.cells) {
    const bx = anchor.x + cell.x, by = anchor.y + cell.y, bz = anchor.z + cell.z;
    for (const [x, y, z] of mirroredCoords(model, bx, by, bz, mx, my)) {
      const k = key(x, y, z);
      if (seen.has(k)) continue;
      seen.add(k);
      const oob = x < 0 || y < 0 || z < 0 || x >= model.nx || y >= model.ny || z >= model.nz;
      const occ = !oob && model.voxels.has(k);
      placements.push({ x, y, z, c: cell.c, conflict: oob || occ });
      if (oob || occ) hasConflict = true;
    }
  }
  return { placements, hasConflict };
}

// ---------- 整体变换 ----------
export function rotate90(model, axis) {
  const { nx, ny, nz } = model;
  const nv = new Map();
  if (axis === 'z') { // 绕高度轴（俯视旋转）
    for (const [k, c] of model.voxels) {
      const [x, y, z] = parseKey(k);
      nv.set(key(ny - 1 - y, x, z), c);
    }
    model.nx = ny; model.ny = nx;
  } else if (axis === 'x') {
    for (const [k, c] of model.voxels) {
      const [x, y, z] = parseKey(k);
      nv.set(key(x, nz - 1 - z, y), c);
    }
    model.ny = nz; model.nz = ny;
  } else { // 'y'
    for (const [k, c] of model.voxels) {
      const [x, y, z] = parseKey(k);
      nv.set(key(z, y, nx - 1 - x), c);
    }
    model.nx = nz; model.nz = nx;
  }
  model.voxels = nv;
}

export function flip(model, axis) {
  const nv = new Map();
  for (const [k, c] of model.voxels) {
    let [x, y, z] = parseKey(k);
    if (axis === 'x') x = model.nx - 1 - x;
    else if (axis === 'y') y = model.ny - 1 - y;
    else z = model.nz - 1 - z;
    nv.set(key(x, y, z), c);
  }
  model.voxels = nv;
}

export function scaleUp(model) {
  const nv = new Map();
  for (const [k, c] of model.voxels) {
    const [x, y, z] = parseKey(k);
    for (let dx = 0; dx < 2; dx++)
      for (let dy = 0; dy < 2; dy++)
        for (let dz = 0; dz < 2; dz++)
          nv.set(key(x * 2 + dx, y * 2 + dy, z * 2 + dz), c);
  }
  model.voxels = nv;
  model.nx *= 2; model.ny *= 2; model.nz *= 2;
}

export function scaleDown(model) {
  const nv = new Map();
  const nx2 = Math.ceil(model.nx / 2), ny2 = Math.ceil(model.ny / 2), nz2 = Math.ceil(model.nz / 2);
  for (let bx = 0; bx < nx2; bx++)
    for (let by = 0; by < ny2; by++)
      for (let bz = 0; bz < nz2; bz++) {
        const counts = new Map();
        for (let dx = 0; dx < 2; dx++)
          for (let dy = 0; dy < 2; dy++)
            for (let dz = 0; dz < 2; dz++) {
              const c = model.voxels.get(key(bx * 2 + dx, by * 2 + dy, bz * 2 + dz));
              if (c !== undefined) counts.set(c, (counts.get(c) || 0) + 1);
            }
        if (counts.size === 0) continue;
        let best = 0, bestN = -1;
        for (const [c, n] of counts) if (n > bestN) { best = c; bestN = n; }
        nv.set(key(bx, by, bz), best);
      }
  model.voxels = nv;
  model.nx = nx2; model.ny = ny2; model.nz = nz2;
}
