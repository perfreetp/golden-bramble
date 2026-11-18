import * as THREE from 'three';
import type { PointKind } from '../types';

/** 各点要素的顶视图颜色 */
export const KIND_COLOR: Record<PointKind, number> = {
  pole: 0xf97316,
  sensor: 0xef4444,
  limit: 0xeab308,
  signWarn: 0xfacc15,
  signOrder: 0x38bdf8,
  signBoard: 0x22d3ee,
  lamp: 0xc4b5fd,
  camera: 0xa78bfa,
  signal: 0xf472b6,
};

export const KIND_COLOR_CSS: Record<PointKind, string> = {
  pole: '#f97316',
  sensor: '#ef4444',
  limit: '#eab308',
  signWarn: '#facc15',
  signOrder: '#38bdf8',
  signBoard: '#22d3ee',
  lamp: '#c4b5fd',
  camera: '#a78bfa',
  signal: '#f472b6',
};

/** LOD1 小点颜色(按图层收敛) */
export const DOT_COLOR: Record<string, number> = {
  pile: 0xfb923c,
  sign: 0x38bdf8,
  device: 0xa78bfa,
};

/**
 * 生成单位尺寸的顶视符号几何体(以原点为中心,XY 平面,渲染时绕 X 旋转铺到 XZ)。
 * 轮廓类符号自带深色描边由 LineSegments 另建。
 */
export function createSymbolGeometry(kind: PointKind): THREE.BufferGeometry {
  const s = 1; // 单位尺寸,实例矩阵负责缩放
  switch (kind) {
    case 'pole':
    case 'sensor':
      return new THREE.CircleGeometry(0.5 * s, 20);
    case 'limit':
      return new THREE.RingGeometry(0.28 * s, 0.5 * s, 24);
    case 'signWarn':
      return triGeometry(0.62 * s);
    case 'signOrder':
      return new THREE.CircleGeometry(0.5 * s, 28);
    case 'signBoard':
      return rectGeometry(1.1 * s, 0.72 * s);
    case 'lamp':
      return starGeometry(0.55 * s, 0.24 * s, 8);
    case 'camera':
      return rectGeometry(0.7 * s, 0.5 * s);
    case 'signal':
      return new THREE.RingGeometry(0.3 * s, 0.5 * s, 6);
  }
}

function triGeometry(r: number): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  const verts = new Float32Array([
    0, r, 0,
    -r * 0.866, -r * 0.5, 0,
    r * 0.866, -r * 0.5, 0,
  ]);
  g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  g.setIndex([0, 1, 2]);
  g.computeVertexNormals();
  return g;
}

function rectGeometry(w: number, h: number): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  const x = w / 2;
  const y = h / 2;
  const verts = new Float32Array([
    -x, -y, 0,
    x, -y, 0,
    x, y, 0,
    -x, y, 0,
  ]);
  g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  g.computeVertexNormals();
  return g;
}

function starGeometry(outer: number, inner: number, points: number): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  const verts: number[] = [0, 0, 0];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    verts.push(Math.cos(a) * r, Math.sin(a) * r, 0);
  }
  const idx: number[] = [];
  for (let i = 1; i <= points * 2; i++) {
    idx.push(0, i, i === points * 2 ? 1 : i + 1);
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** 符号描边(相机/告示牌矩形、三角等的深色边) */
export function createSymbolOutline(kind: PointKind): THREE.BufferGeometry | null {
  const s = 1;
  let pts: THREE.Vector3[] | null = null;
  if (kind === 'signWarn') {
    const r = 0.62 * s;
    pts = [
      new THREE.Vector3(0, r, 0),
      new THREE.Vector3(-r * 0.866, -r * 0.5, 0),
      new THREE.Vector3(r * 0.866, -r * 0.5, 0),
    ];
  } else if (kind === 'signBoard') {
    const w = 1.1 * s;
    const h = 0.72 * s;
    pts = [
      new THREE.Vector3(-w / 2, -h / 2, 0),
      new THREE.Vector3(w / 2, -h / 2, 0),
      new THREE.Vector3(w / 2, h / 2, 0),
      new THREE.Vector3(-w / 2, h / 2, 0),
    ];
  } else if (kind === 'camera') {
    const w = 0.7 * s;
    const h = 0.5 * s;
    pts = [
      new THREE.Vector3(-w / 2, -h / 2, 0),
      new THREE.Vector3(w / 2, -h / 2, 0),
      new THREE.Vector3(w / 2, h / 2, 0),
      new THREE.Vector3(-w / 2, h / 2, 0),
    ];
  }
  if (!pts) return null;
  return new THREE.BufferGeometry().setFromPoints([...pts, pts[0]]);
}
