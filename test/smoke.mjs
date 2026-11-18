// 冒烟测试：mesher + ops（纯逻辑，无 DOM）
import { greedyMesh, decimate } from '../src/mesh/mesher.js';
import { rotate90, flip, scaleUp, scaleDown, pastePlacements, copyRegion, key } from '../src/voxel/ops.js';

let fail = 0;
const eq = (name, got, want) => {
  const ok = got === want;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + ': got ' + got + (ok ? '' : ', want ' + want));
  if (!ok) fail++;
};

// 1) 2x2x2 实心块 -> 6 个四边面
{
  const solid = new Set();
  for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) for (let z = 0; z < 2; z++) solid.add(key(x, y, z));
  const g = greedyMesh((x, y, z) => (solid.has(key(x, y, z)) ? 0 : -1), 2, 2, 2);
  eq('2x2x2 quads', g.quads.length, 6);
  const d = decimate(g.positions, g.quads, g.quadColors, 12, 0);
  eq('2x2x2 tris', d.tris.length, 12);
}

// 2) 3x1x1 长条 -> 6 个四边面（每面合并为 1 个矩形）
{
  const solid = new Set([key(0, 0, 0), key(1, 0, 0), key(2, 0, 0)]);
  const g = greedyMesh((x, y, z) => (solid.has(key(x, y, z)) ? 1 : -1), 3, 1, 1);
  eq('3x1x1 quads', g.quads.length, 6);
  eq('3x1x1 colors', g.quadColors.every((c) => c === 1), true);
}

// 3) 逐体素面（不合并时 3x1x1 应为 14 面）验证合并确实生效
{
  const solid = new Set([key(0, 0, 0), key(1, 0, 0), key(2, 0, 0)]);
  let faces = 0;
  const dirs = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  for (const k of solid) {
    const [x, y, z] = k.split(',').map(Number);
    for (const [dx, dy, dz] of dirs) if (!solid.has(key(x + dx, y + dy, z + dz))) faces++;
  }
  eq('3x1x1 raw faces', faces, 14);
}

// 4) 减面：角度阈值溶掉平面上的内部顶点（2x2 平板）
{
  const solid = new Set();
  for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) solid.add(key(x, y, 0));
  const g = greedyMesh((x, y, z) => (solid.has(key(x, y, z)) ? 0 : -1), 4, 4, 1);
  const d0 = decimate(g.positions, g.quads, g.quadColors, 0, 0);
  const d1 = decimate(g.positions, g.quads, g.quadColors, 30, 0);
  eq('plate quads', g.quads.length, 6);
  eq('plate tris angle0', d0.tris.length, 12);
  eq('plate tris angle30 <= 12', d1.tris.length <= 12, true);
}

// 5) 旋转 90° 保持体素数、维度交换
{
  const m = { nx: 4, ny: 2, nz: 3, voxels: new Map([[key(0, 0, 0), 1], [key(3, 1, 2), 2]]) };
  rotate90(m, 'z');
  eq('rotate z nx', m.nx, 2);
  eq('rotate z ny', m.ny, 4);
  eq('rotate z count', m.voxels.size, 2);
  eq('rotate z pos', m.voxels.get(key(1, 0, 0)), 1); // (0,0,0)->(ny-1-0,0,0)=(1,0,0)
}

// 6) 翻转 + 缩放
{
  const m = { nx: 4, ny: 2, nz: 2, voxels: new Map([[key(0, 0, 0), 1]]) };
  flip(m, 'x');
  eq('flip x', m.voxels.get(key(3, 0, 0)), 1);
  scaleUp(m);
  eq('scaleUp count', m.voxels.size, 8);
  eq('scaleUp nx', m.nx, 8);
  scaleDown(m);
  eq('scaleDown count', m.voxels.size, 1);
  eq('scaleDown nx', m.nx, 4);
}

// 7) 粘贴冲突：占用标冲突、空位可落
{
  const m = { nx: 8, ny: 8, nz: 8, voxels: new Map([[key(2, 2, 0), 0]]) };
  const clip = { w: 2, h: 1, d: 1, cells: [{ x: 0, y: 0, z: 0, c: 1 }, { x: 1, y: 0, z: 0, c: 1 }] };
  const ok = pastePlacements(m, clip, { x: 0, y: 0, z: 0 }, false, false);
  eq('paste no conflict', ok.hasConflict, false);
  const bad = pastePlacements(m, clip, { x: 1, y: 2, z: 0 }, false, false); // 第二格 (2,2,0) 被占
  eq('paste conflict', bad.hasConflict, true);
  eq('paste conflict cell', bad.placements.filter((p) => p.conflict).length, 1);
  const oob = pastePlacements(m, clip, { x: 7, y: 0, z: 0 }, false, false); // 第二格越界
  eq('paste oob conflict', oob.hasConflict, true);
  // 镜像：开 X 镜像后落点翻倍
  const mir = pastePlacements(m, clip, { x: 0, y: 0, z: 0 }, true, false);
  eq('paste mirror placements', mir.placements.length, 4);
}

// 8) 选区复制
{
  const m = { nx: 4, ny: 4, nz: 4, voxels: new Map([[key(1, 1, 1), 3], [key(2, 1, 1), 4], [key(3, 3, 3), 5]]) };
  const clip = copyRegion(m, { x0: 1, y0: 1, z0: 1, x1: 2, y1: 2, z1: 2 });
  eq('copy cells', clip.cells.length, 2);
  eq('copy rel', JSON.stringify(clip.cells[0]), JSON.stringify({ x: 0, y: 0, z: 0, c: 3 }));
}

process.exit(fail ? 1 : 0);
