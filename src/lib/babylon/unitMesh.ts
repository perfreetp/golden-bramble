import {
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Color3,
  DynamicTexture,
  Texture,
  VertexData,
  type Scene,
  type TransformNode,
  type AbstractMesh,
} from '@babylonjs/core';
import type { ObstacleUnit } from '../types';
import { unitRng } from '../generator';

export const POST_RADIUS = 100;

/** 各障碍类型的标准色（正常 / 锁定） */
export const TYPE_COLORS: Record<ObstacleUnit['type'], { normal: Color3; locked: Color3 }> = {
  steps: { normal: new Color3(0.45, 0.55, 0.75), locked: new Color3(0.85, 0.55, 0.2) },
  ramp: { normal: new Color3(0.4, 0.7, 0.45), locked: new Color3(0.85, 0.55, 0.2) },
  posts: { normal: new Color3(0.7, 0.45, 0.65), locked: new Color3(0.85, 0.55, 0.2) },
  bridge: { normal: new Color3(0.55, 0.5, 0.75), locked: new Color3(0.85, 0.55, 0.2) },
  gravel: { normal: new Color3(0.6, 0.55, 0.45), locked: new Color3(0.85, 0.55, 0.2) },
};

function box(name: string, w: number, h: number, d: number, scene: Scene): Mesh {
  return MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
}

/** 台阶：逐级升高的阶梯盒子 */
function buildSteps(u: ObstacleUnit, scene: Scene): AbstractMesh[] {
  const p = u.params;
  const parts: AbstractMesh[] = [];
  const depth = p.stepDepth ?? 300;
  for (let i = 0; i < (p.stepCount ?? 1); i++) {
    const h = (i + 1) * (p.stepHeight ?? 100);
    const m = box(`${u.id}-step${i}`, u.size.w, h, depth, scene);
    m.position.set(0, h / 2, -u.size.d / 2 + (i + 0.5) * depth);
    parts.push(m);
  }
  return parts;
}

/** 斜坡：自定义楔形几何，前低后高 */
function buildRamp(u: ObstacleUnit, scene: Scene): AbstractMesh[] {
  const w = u.size.w;
  const d = u.size.d;
  const h = u.size.h;
  const hw = w / 2;
  const hd = d / 2;
  // 顶点：底面四角 + 后沿顶部两角
  const positions = [
    -hw, 0, -hd, // 0 前左底
    hw, 0, -hd, // 1 前右底
    hw, 0, hd, // 2 后右底
    -hw, 0, hd, // 3 后左底
    -hw, h, hd, // 4 后左顶
    hw, h, hd, // 5 后右顶
  ];
  const face = (a: number, b: number, c: number) => [a, b, c];
  const indices = [
    ...face(0, 1, 2), ...face(0, 2, 3), // 底面
    ...face(3, 2, 5), ...face(3, 5, 4), // 后竖直面
    ...face(0, 4, 5), ...face(0, 5, 1), // 斜面
    ...face(0, 3, 4), // 左侧三角
    ...face(1, 5, 2), // 右侧三角
  ];
  const mesh = new Mesh(`${u.id}-ramp`, scene);
  const vertexData = new VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  const normals = new Float32Array(positions.length);
  VertexData.ComputeNormals(positions, indices, normals);
  vertexData.normals = normals;
  vertexData.applyToMesh(mesh);
  return [mesh];
}

/** 梅花桩：规则排列的圆柱桩 */
function buildPosts(u: ObstacleUnit, scene: Scene): AbstractMesh[] {
  const p = u.params;
  const rows = p.postRows ?? 3;
  const cols = p.postCols ?? 2;
  const spacing = p.postSpacing ?? 500;
  const height = p.postHeight ?? 500;
  const parts: AbstractMesh[] = [];
  const totalW = (cols - 1) * spacing;
  const totalD = (rows - 1) * spacing;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cyl = MeshBuilder.CreateCylinder(`${u.id}-post${r}-${c}`, {
        height,
        diameter: POST_RADIUS * 2,
        tessellation: 16,
      }, scene);
      cyl.position.set(-totalW / 2 + c * spacing, height / 2, -totalD / 2 + r * spacing);
      parts.push(cyl);
    }
  }
  return parts;
}

/** 窄桥：桥面 + 四角支撑柱 + 两侧护栏 */
function buildBridge(u: ObstacleUnit, scene: Scene): AbstractMesh[] {
  const p = u.params;
  const deckH = 60;
  const height = p.bridgeHeight ?? 300;
  const deckY = height + deckH / 2;
  const parts: AbstractMesh[] = [];
  const deck = box(`${u.id}-deck`, u.size.w, deckH, u.size.d, scene);
  deck.position.y = deckY;
  parts.push(deck);

  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const leg = MeshBuilder.CreateCylinder(`${u.id}-leg`, { height, diameter: 50, tessellation: 8 }, scene);
      leg.position.set(sx * (u.size.w / 2 - 60), height / 2, sz * (u.size.d / 2 - 60));
      parts.push(leg);
    }
  }
  const railH = 100;
  for (const sx of [-1, 1]) {
    const rail = box(`${u.id}-rail`, 40, railH, u.size.d, scene);
    rail.position.set(sx * (u.size.w / 2 - 20), deckY + deckH / 2 + railH / 2, 0);
    parts.push(rail);
  }
  return parts;
}

/** 碎石地：确定性位置/尺寸的小石块合并为单个网格 */
function buildGravel(u: ObstacleUnit, scene: Scene): AbstractMesh[] {
  const p = u.params;
  // 独立确定性随机流：同种子石块布局完全一致
  const rng = unitRng((u.rngIndex + 1) * 0x9e3779b9, u.rngIndex);
  const stones: Mesh[] = [];
  const count = p.stoneCount ?? 30;
  const maxSize = p.maxStoneSize ?? 120;
  for (let i = 0; i < count; i++) {
    const sx = rng.range(maxSize * 0.4, maxSize);
    const sy = rng.range(maxSize * 0.3, maxSize * (p.roughness ?? 0.6));
    const sz = rng.range(maxSize * 0.4, maxSize);
    const s = box(`${u.id}-stone${i}`, sx, sy, sz, scene);
    s.position.set(
      rng.range(-u.size.w / 2 + maxSize, u.size.w / 2 - maxSize),
      sy / 2,
      rng.range(-u.size.d / 2 + maxSize, u.size.d / 2 - maxSize),
    );
    s.rotation.y = rng.range(0, Math.PI);
    stones.push(s);
  }
  const merged = Mesh.MergeMeshes(stones, true, true, undefined, false, true);
  if (merged) {
    merged.name = `${u.id}-gravel`;
    return [merged];
  }
  return stones;
}

const BUILDERS: Record<ObstacleUnit['type'], (u: ObstacleUnit, scene: Scene) => AbstractMesh[]> = {
  steps: buildSteps,
  ramp: buildRamp,
  posts: buildPosts,
  bridge: buildBridge,
  gravel: buildGravel,
};

/** 构建单元的全部实体网格（本地坐标，y 从 0 起） */
export function buildUnitMeshes(u: ObstacleUnit, scene: Scene): AbstractMesh[] {
  return BUILDERS[u.type](u, scene);
}

/** 单元材质（按类型复用，锁定换色） */
export function getUnitMaterial(type: ObstacleUnit['type'], locked: boolean, scene: Scene): StandardMaterial {
  const name = `mat-${type}-${locked ? 'locked' : 'normal'}`;
  const existing = scene.getMaterialByName(name);
  if (existing instanceof StandardMaterial) return existing;
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = TYPE_COLORS[type][locked ? 'locked' : 'normal'];
  mat.specularColor = new Color3(0.1, 0.1, 0.1);
  return mat;
}

/** 线框包围盒（单元根节点的子节点） */
export function buildBoundingBox(u: ObstacleUnit, scene: Scene): Mesh {
  const bb = box(`${u.id}-bbox`, u.size.w, u.size.h, u.size.d, scene);
  bb.position.y = u.size.h / 2;
  const mat = new StandardMaterial(`${u.id}-bboxmat`, scene);
  mat.wireframe = true;
  mat.emissiveColor = new Color3(1, 0.6, 0.1);
  mat.disableLighting = true;
  bb.material = mat;
  bb.metadata = { helper: true, export: false };
  bb.isPickable = false;
  bb.setEnabled(false);
  return bb;
}

/** 坡度/高度标注牌（朝向相机） */
export function buildAnnotation(u: ObstacleUnit, lines: string[], scene: Scene): Mesh {
  const tex = new DynamicTexture(`${u.id}-anno`, { width: 320, height: 140 }, scene, true);
  const ctx = tex.getContext() as CanvasRenderingContext2D;
  ctx.fillStyle = 'rgba(20,28,40,0.85)';
  ctx.fillRect(0, 0, 320, 140);
  ctx.strokeStyle = '#ffb347';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 316, 136);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, 18, 48 + i * 44));
  tex.update();
  const plane = MeshBuilder.CreatePlane(`${u.id}-annotation`, { width: 900, height: 394 }, scene);
  const mat = new StandardMaterial(`${u.id}-annomat`, scene);
  mat.diffuseTexture = tex;
  mat.emissiveTexture = tex;
  mat.diffuseTexture.hasAlpha = true;
  mat.useAlphaFromDiffuseTexture = true;
  mat.backFaceCulling = false;
  mat.disableLighting = true;
  plane.material = mat;
  plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
  plane.position.y = u.size.h + 450;
  plane.metadata = { helper: true, export: false };
  plane.isPickable = false;
  plane.setEnabled(false);
  return plane;
}

export function disposeNodeTree(root: TransformNode): void {
  root.getChildMeshes().forEach((m) => {
    if (m.metadata?.helper) {
      const mat = m.material;
      if (mat) {
        const tex = (mat as StandardMaterial).diffuseTexture;
        tex?.dispose();
        mat.dispose();
      }
    }
    m.dispose();
  });
  root.dispose();
}
