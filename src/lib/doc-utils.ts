// 文档查询与有效路径求值（复合节点实时布尔、弧排布变换）
import type { CompoundNode, DocNode, GroupNode, PathData, Pt, ShapeNode, SprayDoc } from '../types';
import { applyBoolean } from './boolean';
import { bboxOf, clonePath, pathBBox, placePath, pointAtArc, samplePath, translatePath, v } from './geometry';

export function nodeMap(doc: SprayDoc): Map<string, DocNode> {
  return new Map(doc.nodes.map((n) => [n.id, n]));
}

export function getNode(doc: SprayDoc, id: string | null | undefined): DocNode | undefined {
  if (!id) return undefined;
  return doc.nodes.find((n) => n.id === id);
}

export function childrenOf(doc: SprayDoc, parentId: string): DocNode[] {
  return doc.nodes.filter((n) => (n as ShapeNode).parentId === parentId);
}

export function shapeChildren(doc: SprayDoc, parentId: string): ShapeNode[] {
  return childrenOf(doc, parentId).filter((n): n is ShapeNode => n.type === 'shape');
}

const compoundOwnerCache = new WeakMap<SprayDoc, Set<string>>();
export function ownedByCompound(doc: SprayDoc): Set<string> {
  const cached = compoundOwnerCache.get(doc);
  if (cached) return cached;
  const set = new Set<string>();
  for (const n of doc.nodes) {
    if (n.type === 'compound') n.childIds.forEach((id) => set.add(id));
  }
  compoundOwnerCache.set(doc, set);
  return set;
}

/** 顶层可操作节点：无 parent 且未被复合节点收纳 */
export function topLevelNodes(doc: SprayDoc): DocNode[] {
  const owned = ownedByCompound(doc);
  return doc.nodes.filter((n) => {
    const parent = (n as ShapeNode).parentId;
    return parent == null && !owned.has(n.id);
  });
}

// ---------- 弧排布 ----------

const railSampleCache = new WeakMap<object, ReturnType<typeof samplePath>>();

export function railSamples(group: GroupNode) {
  if (!group.arcLayout) return [];
  const cached = railSampleCache.get(group.arcLayout);
  if (cached) return cached;
  const s = samplePath(group.arcLayout.rail, 2);
  railSampleCache.set(group.arcLayout, s);
  return s;
}

/** 求组内全部成员在滑道弧上的实际摆放路径 */
export function effectiveGroupPaths(doc: SprayDoc, group: GroupNode): PathData[] {
  const layout = group.arcLayout;
  const members = shapeChildren(doc, group.id);
  if (!layout) return members.map((s) => s.path);
  const samples = railSamples(group);
  return members.map((s, i) => {
    const arc = layout.memberArcs[i] ?? layout.startOffset + i * layout.spacing;
    const { p, tan } = pointAtArc(samples, arc);
    const angle = layout.rotateToTangent ? Math.atan2(tan.y, tan.x) + Math.PI / 2 : 0;
    return placePath(s.path, angle, p);
  });
}

/** 复合节点实时求值：源节点路径 → 布尔结果路径（结果为直线段节点，源节点仍可拖拽编辑） */
export function effectiveCompoundPaths(doc: SprayDoc, compound: CompoundNode): PathData[] {
  const map = nodeMap(doc);
  const sourcePaths: PathData[] = [];
  for (const id of compound.childIds) {
    const n = map.get(id);
    if (!n || !n.visible) continue;
    if (n.type === 'shape') {
      const parent = n.parentId ? (map.get(n.parentId) as GroupNode | undefined) : undefined;
      if (parent && parent.type === 'group' && parent.arcLayout) {
        const idx = shapeChildren(doc, parent.id).findIndex((s) => s.id === n.id);
        const layout = parent.arcLayout;
        const arc = layout.memberArcs[idx] ?? layout.startOffset + idx * layout.spacing;
        const { p, tan } = pointAtArc(railSamples(parent), arc);
        const angle = layout.rotateToTangent ? Math.atan2(tan.y, tan.x) + Math.PI / 2 : 0;
        sourcePaths.push(placePath(n.path, angle, p));
      } else {
        sourcePaths.push(n.path);
      }
    } else if (n.type === 'compound') {
      sourcePaths.push(...effectiveCompoundPaths(doc, n));
    }
  }
  if (sourcePaths.length < 2) return sourcePaths.map(clonePath);
  return applyBoolean(compound.op, sourcePaths).paths;
}

/** 任意节点的有效路径集合（文档坐标） */
export function effectivePaths(doc: SprayDoc, node: DocNode): PathData[] {
  if (node.type === 'shape') return [node.path];
  if (node.type === 'group') return effectiveGroupPaths(doc, node);
  return effectiveCompoundPaths(doc, node);
}

/** 节点命中测试用的多边形采样点 */
export function hitPolygons(doc: SprayDoc, node: DocNode): Pt[][] {
  return effectivePaths(doc, node)
    .filter((p) => p.closed)
    .map((p) => samplePath(p, 3).map((s) => s.p));
}

export function docBBox(doc: SprayDoc): { x: number; y: number; w: number; h: number } {
  const pts: Pt[] = [];
  for (const n of topLevelNodes(doc)) {
    for (const p of effectivePaths(doc, n)) pts.push(...p.nodes.map((nd) => v(nd.x, nd.y)));
  }
  if (!pts.length) return { x: 0, y: 0, w: 10, h: 10 };
  return bboxOf(pts);
}

/** 把形状路径平移到以自身 bbox 中心为原点（弧排布组成员用） */
export function centerPath(path: PathData): PathData {
  const b = pathBBox(path);
  return translatePath(path, -(b.x + b.w / 2), -(b.y + b.h / 2));
}
