// 批次自动质检规则
import { greedyMesh, decimate } from '../mesh/mesher';

const DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

export function runChecks(model) {
  const issues = [];
  const add = (sev, code, msg) => issues.push({ sev, code, msg });
  const vox = model.voxels;
  const n = vox.size;
  if (n === 0) {
    add('严重', 'EMPTY', '模型为空，没有任何体素');
    return issues;
  }

  // 1) 连通性：分离部件有小件脱落被误食风险
  const seen = new Set();
  let comps = 0;
  for (const k of vox.keys()) {
    if (seen.has(k)) continue;
    comps++;
    const stack = [k];
    seen.add(k);
    while (stack.length) {
      const [x, y, z] = stack.pop().split(',').map(Number);
      for (const [dx, dy, dz] of DIRS) {
        const nk = (x + dx) + ',' + (y + dy) + ',' + (z + dz);
        if (vox.has(nk) && !seen.has(nk)) { seen.add(nk); stack.push(nk); }
      }
    }
  }
  if (comps > 1) add('严重', 'DISCONN', `存在 ${comps} 个互不相连的部件，小件脱落可能被宠物误食`);

  // 2) 尖细结构：仅单点连接的体素易在啃咬中断裂
  let thin = 0;
  for (const k of vox.keys()) {
    const [x, y, z] = k.split(',').map(Number);
    let nb = 0;
    for (const [dx, dy, dz] of DIRS)
      if (vox.has((x + dx) + ',' + (y + dy) + ',' + (z + dz))) nb++;
    if (nb <= 1) thin++;
  }
  if (thin > 0)
    add('不建议', 'THIN', `存在 ${thin} 个仅单点连接的尖细体素（占 ${((thin / n) * 100).toFixed(1)}%），啃咬中易断裂`);

  // 3) 尺寸规格
  let minX = 1e9, minY = 1e9, minZ = 1e9, maxX = -1e9, maxY = -1e9, maxZ = -1e9;
  for (const k of vox.keys()) {
    const [x, y, z] = k.split(',').map(Number);
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }
  const sx = (maxX - minX + 1) * model.cellMm;
  const sy = (maxY - minY + 1) * model.cellMm;
  const sz = (maxZ - minZ + 1) * model.cellMm;
  const maxDim = Math.max(sx, sy, sz);
  const minDim = Math.min(sx, sy, sz);
  if (maxDim > 300) add('严重', 'TOOBIG', `最大边 ${maxDim}mm 超出咬胶规格上限 300mm`);
  if (minDim < 10) add('严重', 'TOOSMALL', `最小边 ${minDim}mm 小于 10mm，整体过小有误吞风险`);

  // 4) 面数（按默认减面参数估算）
  const getter = (x, y, z) => {
    const c = vox.get(x + ',' + y + ',' + z);
    return c === undefined ? -1 : c;
  };
  const g = greedyMesh(getter, model.nx, model.ny, model.nz);
  const dec = decimate(g.positions, g.quads, g.quadColors, 12, 0);
  if (dec.tris.length > 60000)
    add('不建议', 'FACES', `减面后三角面 ${dec.tris.length} 超过 60000，模具加工数据量偏大`);

  // 5) 颜色数
  const used = new Set(vox.values());
  if (used.size > 6)
    add('不建议', 'COLORS', `使用 ${used.size} 种颜色，超过 6 色将明显增加模具与注塑成本`);

  return issues;
}
