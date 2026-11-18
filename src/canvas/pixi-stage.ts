// PixiJS 画布控制器：渲染图层/路径/手柄/参考线，处理命中、拖拽、吸附、框选、批注
import { Application, Graphics } from 'pixijs';
import type { Annotation, CompoundNode, DocNode, GroupNode, PathData, Pt, ShapeNode, ViewTransform } from '../types';
import { docState, uiState, beginInteraction, endInteraction, setSelection, toggleSelection, updateLive } from '../store';
import {
  effectivePaths,
  hitPolygons,
  nodeMap,
  ownedByCompound,
  railSamples,
  shapeChildren,
  topLevelNodes,
} from '../lib/doc-utils';
import {
  bboxOf,
  pointAtArc,
  pointInPolygon,
  nearestOnPath,
  samplePath,
  segmentsOf,
  translatePath,
  v,
} from '../lib/geometry';

const HANDLE_R = 5;
const SNAP_DIST = 9; // 屏幕像素

type DragMode =
  | { kind: 'none' }
  | { kind: 'pan'; startX: number; startY: number; view: ViewTransform }
  | { kind: 'marquee'; startDoc: Pt; currentDoc: Pt; additive: boolean }
  | { kind: 'shape'; ids: string[]; startDoc: Pt; lastDoc: Pt }
  | { kind: 'node'; shapeId: string; nodeIndex: number }
  | { kind: 'control'; shapeId: string; nodeIndex: number; which: 'c1' | 'c2' }
  | { kind: 'annotation'; path: PathData };

export interface StageCallbacks {
  onAnnotationCreated?: (loop: PathData) => void;
}

interface SnapResult {
  point: Pt;
  target: Pt;
  kind: string;
  axis: 'x' | 'y' | 'point';
}

/** 旧版本文档缓存（组件层选择对比版本时写入，用于差异叠加） */
export const compareDocCache = new Map<string, import('../types').SprayDoc>();

export class PixiStage {
  app: Application;
  layer = new Graphics();
  guideLayer = new Graphics();
  overlay = new Graphics();
  handles = new Graphics();
  compareLayer = new Graphics();
  annotationLayer = new Graphics();
  private drag: DragMode = { kind: 'none' };
  private guides: { from: Pt; to: Pt; snapPoint: Pt; label: string }[] = [];
  private altDown = false;
  private disposed = false;
  private cb: StageCallbacks;
  private hitOrder: DocNode[] = [];

  constructor(canvasContainer: HTMLElement, cb: StageCallbacks = {}) {
    this.cb = cb;
    this.app = new Application({
      background: '#f4f6f9',
      antialias: true,
      resizeTo: canvasContainer,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    canvasContainer.appendChild(this.app.view as unknown as HTMLCanvasElement);
    this.app.stage.addChild(
      this.layer,
      this.compareLayer,
      this.annotationLayer,
      this.overlay,
      this.guideLayer,
      this.handles,
    );
    this.bindEvents(canvasContainer);
    this.app.ticker.add(() => this.render());
  }

  get view(): ViewTransform {
    return uiState.view;
  }

  /** 调试/自动化用：当前拖拽模式 */
  get debugDragKind(): string {
    return this.drag.kind;
  }

  toDoc(screenX: number, screenY: number): Pt {
    const { scale, tx, ty } = this.view;
    return v((screenX - tx) / scale, (screenY - ty) / scale);
  }

  // ---------- 事件 ----------

  private bindEvents(el: HTMLElement): void {
    el.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    el.addEventListener('dblclick', this.onDblClick);
    el.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Alt') this.altDown = true;
  };
  private onKeyUp = (e: KeyboardEvent): void => {
    if (e.key === 'Alt') this.altDown = false;
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const rect = (this.app.view as HTMLCanvasElement).getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const before = this.toDoc(mx, my);
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const scale = Math.min(8, Math.max(0.12, this.view.scale * factor));
    this.view.scale = scale;
    this.view.tx = mx - before.x * scale;
    this.view.ty = my - before.y * scale;
  };

  private onPointerDown = (e: PointerEvent): void => {
    if (e.button === 1 || (e.button === 0 && uiState.tool === 'pan')) {
      this.drag = { kind: 'pan', startX: e.clientX, startY: e.clientY, view: { ...this.view } };
      return;
    }
    if (e.button !== 0) return;
    const rect = (this.app.view as HTMLCanvasElement).getBoundingClientRect();
    const doc = this.toDoc(e.clientX - rect.left, e.clientY - rect.top);

    if (uiState.tool === 'annotate') {
      this.drag = { kind: 'annotation', path: { closed: false, nodes: [{ x: doc.x, y: doc.y }] } };
      return;
    }

    if (uiState.tool === 'node') {
      const handle = this.hitHandle(doc);
      if (handle) {
        beginInteraction();
        if (handle.kind === 'node') {
          this.drag = { kind: 'node', shapeId: handle.shapeId, nodeIndex: handle.index };
        } else {
          this.drag = { kind: 'control', shapeId: handle.shapeId, nodeIndex: handle.index, which: handle.which! };
        }
        return;
      }
    }

    const hit = this.hitTest(doc);
    if (hit) {
      const additive = e.shiftKey;
      if (additive) {
        toggleSelection(hit.id);
      } else if (!uiState.selection.includes(hit.id)) {
        setSelection([hit.id]);
      }
      if (!hit.locked && uiState.tool !== 'node') {
        beginInteraction();
        this.drag = {
          kind: 'shape',
          ids: uiState.selection.includes(hit.id) ? [...uiState.selection] : [hit.id],
          startDoc: doc,
          lastDoc: doc,
        };
      }
    } else {
      this.drag = { kind: 'marquee', startDoc: doc, currentDoc: doc, additive: e.shiftKey };
    }
  };

  private onPointerMove = (e: PointerEvent): void => {
    const rect = (this.app.view as HTMLCanvasElement).getBoundingClientRect();
    const doc = this.toDoc(e.clientX - rect.left, e.clientY - rect.top);

    switch (this.drag.kind) {
      case 'pan': {
        const d = this.drag;
        this.view.tx = d.view.tx + (e.clientX - d.startX);
        this.view.ty = d.view.ty + (e.clientY - d.startY);
        return;
      }
      case 'marquee':
        this.drag.currentDoc = doc;
        return;
      case 'annotation': {
        const path = this.drag.path;
        const last = path.nodes[path.nodes.length - 1];
        if (Math.hypot(doc.x - last.x, doc.y - last.y) * this.view.scale > 4) {
          path.nodes.push({ x: doc.x, y: doc.y });
        }
        return;
      }
      case 'node': {
        const d = this.drag;
        updateLive((draft) => {
          const n = draft.nodes.find((x) => x.id === d.shapeId);
          if (n?.type === 'shape' && !n.locked) {
            const node = n.path.nodes[d.nodeIndex];
            if (node) {
              node.x = doc.x;
              node.y = doc.y;
            }
          }
        });
        return;
      }
      case 'control': {
        const d = this.drag;
        updateLive((draft) => {
          const n = draft.nodes.find((x) => x.id === d.shapeId);
          if (n?.type === 'shape' && !n.locked) {
            const node = n.path.nodes[d.nodeIndex];
            if (node) node[d.which] = { x: doc.x - node.x, y: doc.y - node.y };
          }
        });
        return;
      }
      case 'shape': {
        const d = this.drag;
        const dx = doc.x - d.lastDoc.x;
        const dy = doc.y - d.lastDoc.y;
        this.guides = [];
        let snap: SnapResult | null = null;
        if (uiState.snappingEnabled && !this.altDown) {
          snap = this.computeSnap(d.ids, doc);
        }
        let moveX = dx;
        let moveY = dy;
        if (snap) {
          const shiftX = snap.target.x - snap.point.x;
          const shiftY = snap.target.y - snap.point.y;
          if (snap.axis === 'x') moveX += shiftX;
          else if (snap.axis === 'y') moveY += shiftY;
          else {
            moveX += shiftX;
            moveY += shiftY;
          }
          this.guides = this.buildGuides(snap);
        }
        if (moveX !== 0 || moveY !== 0) this.translateNodes(d.ids, moveX, moveY);
        d.lastDoc = v(doc.x, doc.y);
        return;
      }
    }
  };

  private onPointerUp = (): void => {
    switch (this.drag.kind) {
      case 'marquee': {
        const d = this.drag;
        const box = bboxOf([d.startDoc, d.currentDoc]);
        const picked = this.hitOrder
          .filter((n) => !n.locked && n.visible)
          .filter((n) =>
            hitPolygons(docState.doc, n).some((poly) =>
              poly.some(
                (p) =>
                  p.x >= box.x && p.x <= box.x + box.w && p.y >= box.y && p.y <= box.y + box.h,
              ),
            ),
          )
          .map((n) => n.id);
        setSelection(d.additive ? [...new Set([...uiState.selection, ...picked])] : picked);
        break;
      }
      case 'annotation': {
        const path = this.drag.path;
        if (path.nodes.length > 2) {
          const loop: PathData = { closed: true, nodes: path.nodes.map((n) => ({ ...n })) };
          this.cb.onAnnotationCreated?.(loop);
        }
        break;
      }
      case 'shape':
      case 'node':
      case 'control':
        endInteraction('拖拽');
        break;
    }
    this.drag = { kind: 'none' };
    this.guides = [];
  };

  private onDblClick = (e: MouseEvent): void => {
    const rect = (this.app.view as HTMLCanvasElement).getBoundingClientRect();
    const doc = this.toDoc(e.clientX - rect.left, e.clientY - rect.top);
    if (uiState.tool === 'node') {
      const shape = this.editableShape();
      if (shape) {
        const near = nearestOnPath(doc, shape.path);
        if (near.distance < 12 / this.view.scale) {
          window.dispatchEvent(
            new CustomEvent('stage:insert-node', {
              detail: { shapeId: shape.id, nodeIndex: near.segIndex, at: near.point },
            }),
          );
        }
      }
    } else {
      const hit = this.hitTest(doc);
      if (hit?.node.type === 'compound') {
        window.dispatchEvent(new CustomEvent('stage:edit-compound', { detail: { id: hit.id } }));
      } else if (hit?.node.type === 'group') {
        window.dispatchEvent(new CustomEvent('stage:edit-group', { detail: { id: hit.id } }));
      }
    }
  };

  // ---------- 命中 ----------

  private hitTest(doc: Pt): { id: string; node: DocNode; locked: boolean } | null {
    const owned = ownedByCompound(docState.doc);
    const all = topLevelNodes(docState.doc).filter((n) => n.visible);
    // 复合节点编辑态：把该复合节点的源形状也纳入命中，便于直接选源节点拖锚点
    const editId = uiState.compoundEditId;
    if (editId) {
      const compound = nodeMap(docState.doc).get(editId);
      if (compound && compound.type === 'compound') {
        const sources = compound.childIds
          .map((cid) => nodeMap(docState.doc).get(cid))
          .filter((n): n is DocNode => !!n && n.visible);
        for (const node of [...sources].reverse()) {
          const polys = hitPolygons(docState.doc, node);
          if (polys.some((poly) => pointInPolygon(doc, poly))) {
            return { id: node.id, node, locked: node.locked };
          }
        }
      }
    }
    this.hitOrder = all;
    for (const node of [...all].reverse()) {
      const polys = hitPolygons(docState.doc, node);
      if (polys.some((poly) => pointInPolygon(doc, poly))) {
        return { id: node.id, node, locked: node.locked || owned.has(node.id) };
      }
    }
    return null;
  }

  private editableShape(): ShapeNode | null {
    const sel = uiState.selection;
    if (sel.length !== 1) return null;
    const n = nodeMap(docState.doc).get(sel[0]);
    return n && n.type === 'shape' ? n : null;
  }

  private hitHandle(doc: Pt):
    | { kind: 'node' | 'control'; shapeId: string; index: number; which?: 'c1' | 'c2' }
    | null {
    const shape = this.editableShape();
    if (!shape || shape.locked) return null;
    const nodeTol = (HANDLE_R + 3) / this.view.scale;
    // 锚点优先：平滑曲线的控制柄可能紧贴锚点，避免点锚点误中控制柄
    for (let i = 0; i < shape.path.nodes.length; i++) {
      const node = shape.path.nodes[i];
      if (Math.hypot(node.x - doc.x, node.y - doc.y) < nodeTol) {
        return { kind: 'node', shapeId: shape.id, index: i };
      }
    }
    // 控制点用更小的容差，只有明确点在控制柄上才命中
    const ctrlTol = (HANDLE_R + 1) / this.view.scale;
    for (let i = 0; i < shape.path.nodes.length; i++) {
      const node = shape.path.nodes[i];
      for (const which of ['c1', 'c2'] as const) {
        const off = node[which];
        if (off) {
          const cp = v(node.x + off.x, node.y + off.y);
          // 控制柄与锚点重合时（偏移≈0）跳过，让锚点生效
          if (Math.hypot(off.x, off.y) < nodeTol) continue;
          if (Math.hypot(cp.x - doc.x, cp.y - doc.y) < ctrlTol) {
            return { kind: 'control', shapeId: shape.id, index: i, which };
          }
        }
      }
    }
    return null;
  }

  // ---------- 吸附 ----------

  /** 取图形包围盒的 8 个特征点（四角 + 四边中点）作为吸附候选 */
  private featurePoints(ids: Set<string>): Pt[] {
    const pts: Pt[] = [];
    for (const id of ids) {
      const n = nodeMap(docState.doc).get(id);
      if (!n) continue;
      for (const p of effectivePaths(docState.doc, n)) {
        const b = bboxOf(p.nodes.map((nd) => v(nd.x, nd.y)));
        pts.push(
          v(b.x, b.y), v(b.x + b.w, b.y), v(b.x, b.y + b.h), v(b.x + b.w, b.y + b.h),
          v(b.x + b.w / 2, b.y), v(b.x + b.w / 2, b.y + b.h),
          v(b.x, b.y + b.h / 2), v(b.x + b.w, b.y + b.h / 2),
        );
      }
    }
    return pts;
  }

  private computeSnap(movingIds: string[], pointer: Pt): SnapResult | null {
    const moving = new Set(movingIds);
    const sourcePts = this.featurePoints(moving);
    // 静止目标特征点：端点、段中点；切点取指针在目标路径上的最近点
    const targets: { p: Pt; kind: string }[] = [];
    for (const n of topLevelNodes(docState.doc)) {
      if (moving.has(n.id) || !n.visible || n.locked) continue;
      for (const path of effectivePaths(docState.doc, n)) {
        path.nodes.forEach((nd) => targets.push({ p: v(nd.x, nd.y), kind: '端点' }));
        for (const s of segmentsOf(path)) {
          targets.push({ p: v((s.p0.x + s.p1.x) / 2, (s.p0.y + s.p1.y) / 2), kind: '中点' });
        }
        const near = nearestOnPath(pointer, path);
        if (near.distance < 40 / this.view.scale) {
          targets.push({ p: near.point, kind: '切点' });
        }
      }
    }
    if (!sourcePts.length || !targets.length) return null;
    const tol = SNAP_DIST / this.view.scale;
    // 点吸附：找距离最近的特征点对
    let bestPoint: { sp: Pt; tp: Pt; kind: string; d: number } | null = null;
    // 轴向引导：x/y 坐标对齐
    let bestX: { sp: Pt; tp: Pt; kind: string; d: number } | null = null;
    let bestY: { sp: Pt; tp: Pt; kind: string; d: number } | null = null;
    for (const sp of sourcePts) {
      for (const t of targets) {
        const ddx = sp.x - t.p.x;
        const ddy = sp.y - t.p.y;
        const dd = Math.hypot(ddx, ddy);
        if (dd < tol && (!bestPoint || dd < bestPoint.d)) {
          bestPoint = { sp, tp: t.p, kind: t.kind, d: dd };
        }
        if (Math.abs(ddx) < tol && (!bestX || Math.abs(ddx) < bestX.d)) {
          bestX = { sp, tp: t.p, kind: t.kind, d: Math.abs(ddx) };
        }
        if (Math.abs(ddy) < tol && (!bestY || Math.abs(ddy) < bestY.d)) {
          bestY = { sp, tp: t.p, kind: t.kind, d: Math.abs(ddy) };
        }
      }
    }
    // 点吸附优先；否则取更强的轴向对齐
    if (bestPoint) {
      return { point: bestPoint.sp, target: bestPoint.tp, kind: bestPoint.kind, axis: 'point' };
    }
    if (bestX && (!bestY || bestX.d <= bestY.d)) {
      return { point: bestX.sp, target: bestX.tp, kind: bestX.kind, axis: 'x' };
    }
    if (bestY) {
      return { point: bestY.sp, target: bestY.tp, kind: bestY.kind, axis: 'y' };
    }
    return null;
  }

  private buildGuides(snap: SnapResult): { from: Pt; to: Pt; snapPoint: Pt; label: string }[] {
    const t = snap.target;
    const span = 400;
    if (snap.axis === 'x') {
      return [{ from: v(t.x, t.y - span), to: v(t.x, t.y + span), snapPoint: t, label: snap.kind }];
    }
    if (snap.axis === 'y') {
      return [{ from: v(t.x - span, t.y), to: v(t.x + span, t.y), snapPoint: t, label: snap.kind }];
    }
    return [
      { from: v(t.x, t.y - span), to: v(t.x, t.y + span), snapPoint: t, label: snap.kind },
      { from: v(t.x - span, t.y), to: v(t.x + span, t.y), snapPoint: t, label: snap.kind },
    ];
  }

  private translateNodes(ids: string[], dx: number, dy: number): void {
    updateLive((draft) => {
      const set = new Set(ids);
      for (const n of draft.nodes) {
        if (set.has(n.id) && n.type === 'shape' && !n.locked) {
          n.path = translatePath(n.path, dx, dy);
        }
      }
    });
  }

  // ---------- 渲染 ----------

  render(): void {
    if (this.disposed) return;
    const { scale, tx, ty } = this.view;
    this.app.stage.scale.set(scale);
    this.app.stage.position.set(tx, ty);

    this.layer.clear();
    this.overlay.clear();
    this.handles.clear();
    this.guideLayer.clear();
    this.compareLayer.clear();
    this.annotationLayer.clear();

    this.drawSlideRail();
    this.drawCompare();
    this.drawNodes();
    this.drawAnnotations();
    this.drawMarquee();
    this.drawGuides();
    this.drawHandles();
  }

  private tracePath(g: Graphics, path: PathData): void {
    const segs = segmentsOf(path);
    if (!segs.length) return;
    g.moveTo(path.nodes[0].x, path.nodes[0].y);
    for (const sg of segs) {
      if (sg.curved) g.bezierCurveTo(sg.c1.x, sg.c1.y, sg.c2.x, sg.c2.y, sg.p1.x, sg.p1.y);
      else g.lineTo(sg.p1.x, sg.p1.y);
    }
    if (path.closed) g.closePath();
  }

  private drawPath(
    g: Graphics,
    path: PathData,
    fill: string | null,
    stroke: string | null,
    strokeWidth: number,
    alpha = 1,
  ): void {
    if (!path.nodes.length) return;
    if (fill) g.beginFill(this.toHex(fill), alpha);
    if (stroke && strokeWidth > 0) g.lineStyle(strokeWidth, this.toHex(stroke), alpha);
    this.tracePath(g, path);
    if (fill) g.endFill();
    if (stroke && strokeWidth > 0) g.lineStyle(0);
  }

  private toHex(color: string | number): number {
    if (typeof color === 'number') return color;
    let c = color.trim().replace('#', '');
    if (c.length === 3) c = c.split('').map((ch) => ch + ch).join('');
    return parseInt(c, 16);
  }

  private strokePath(g: Graphics, path: PathData, color: number, width: number, alpha: number, dashed = false): void {
    if (dashed) {
      this.dashedTrace(g, path, color, width, alpha);
      return;
    }
    g.lineStyle(width, color, alpha);
    this.tracePath(g, path);
    g.lineStyle(0);
  }

  /** v7 无原生虚线：沿采样折线按全局弧长游标切分 dash/gap 段 */
  private dashedTrace(g: Graphics, path: PathData, color: number, width: number, alpha: number): void {
    const samples = samplePath(path, 2);
    if (samples.length < 2) return;
    const dash = 7 / this.view.scale;
    const gap = 5 / this.view.scale;
    const cycle = dash + gap;
    const lerp = (a: Pt, b: Pt, t: number): Pt => ({
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    });
    g.lineStyle(width, color, alpha);
    let cursor = 0; // 已沿路径行进的弧长
    for (let i = 1; i < samples.length; i++) {
      const a = samples[i - 1].p;
      const b = samples[i].p;
      const segLen = Math.hypot(b.x - a.x, b.y - a.y);
      if (segLen === 0) continue;
      let segStart = 0;
      while (segStart < segLen) {
        const phase = cursor % cycle;
        const inDash = phase < dash;
        const endOfPhase = inDash ? dash : cycle;
        const take = Math.min(endOfPhase - phase, segLen - segStart);
        if (inDash) {
          const pA = lerp(a, b, segStart / segLen);
          const pB = lerp(a, b, (segStart + take) / segLen);
          g.moveTo(pA.x, pA.y);
          g.lineTo(pB.x, pB.y);
        }
        cursor += take;
        segStart += take;
      }
    }
    g.lineStyle(0);
  }

  private fillCircle(g: Graphics, x: number, y: number, r: number, color: number, alpha = 1): void {
    g.beginFill(color, alpha);
    g.drawCircle(x, y, r);
    g.endFill();
  }

  private strokeCircle(g: Graphics, x: number, y: number, r: number, color: number, width: number): void {
    g.lineStyle(width, color, 1);
    g.drawCircle(x, y, r);
    g.lineStyle(0);
  }

  private drawNodes(): void {
    const doc = docState.doc;
    const selected = new Set(uiState.selection);
    const editCompound = uiState.compoundEditId;
    for (const node of topLevelNodes(doc)) {
      if (!node.visible) continue;
      const paths = effectivePaths(doc, node);
      const isSel = selected.has(node.id);
      if (node.type === 'group') {
        const members = shapeChildren(doc, node.id);
        paths.forEach((p, i) => {
          const style = members[i]?.style;
          this.drawPath(
            this.layer, p, style?.fill ?? null, style?.stroke ?? null, style?.strokeWidth ?? 0,
            node.locked ? 0.55 : 1,
          );
        });
        if (isSel) this.drawBBox(paths, 0x1d5a8c, true);
        if (node.arcLayout) this.drawRail(node);
      } else if (node.type === 'compound') {
        const editing = editCompound === node.id;
        paths.forEach((p) =>
          this.drawPath(this.layer, p, node.style.fill, node.style.stroke, node.style.strokeWidth, editing ? 0.55 : 1),
        );
        if (isSel || editing) this.drawBBox(paths, editing ? 0xd9480f : 0x1d5a8c, true);
        if (editing) this.drawCompoundSources(node);
      } else {
        this.drawPath(
          this.layer, node.path, node.style.fill, node.style.stroke, node.style.strokeWidth,
          node.locked ? 0.55 : 1,
        );
        if (isSel) this.drawBBox([node.path], 0x1d5a8c, true);
      }
    }
  }

  private drawCompoundSources(compound: CompoundNode): void {
    const map = nodeMap(docState.doc);
    for (const id of compound.childIds) {
      const n = map.get(id);
      if (!n) continue;
      for (const p of effectivePaths(docState.doc, n)) {
        this.strokePath(this.overlay, p, 0xd9480f, 1.2 / this.view.scale, 0.9);
      }
    }
  }

  private drawBBox(paths: PathData[], color: number, dashed: boolean): void {
    const pts = paths.flatMap((p) => p.nodes.map((n) => v(n.x, n.y)));
    if (!pts.length) return;
    const b = bboxOf(pts);
    const rectPath: PathData = {
      closed: true,
      nodes: [
        { x: b.x - 4, y: b.y - 4 },
        { x: b.x + b.w + 4, y: b.y - 4 },
        { x: b.x + b.w + 4, y: b.y + b.h + 4 },
        { x: b.x - 4, y: b.y + b.h + 4 },
      ],
    };
    this.strokePath(this.overlay, rectPath, color, 1.4 / this.view.scale, 0.9, dashed);
  }

  private drawRail(group: GroupNode): void {
    if (!group.arcLayout) return;
    const rail = group.arcLayout.rail;
    this.dashedTrace(this.overlay, rail, 0x2f9e44, 2 / this.view.scale, 0.8);
    const samples = railSamples(group);
    group.arcLayout.memberArcs.forEach((arc) => {
      const { p } = pointAtArc(samples, arc);
      this.fillCircle(this.overlay, p.x, p.y, 4 / this.view.scale, 0x2f9e44, 0.9);
    });
  }

  private drawSlideRail(): void {
    const rail = docState.doc.slideRail;
    if (!rail || rail.nodes.length === 0) return;
    this.dashedTrace(this.overlay, rail, 0x868e96, 1.5 / this.view.scale, 0.6);
  }

  private drawHandles(): void {
    if (uiState.tool !== 'node') return;
    const shape = this.editableShape();
    if (!shape || shape.locked) return;
    const g = this.handles;
    shape.path.nodes.forEach((node) => {
      (['c1', 'c2'] as const).forEach((which) => {
        const off = node[which];
        if (off) {
          const cp = v(node.x + off.x, node.y + off.y);
          g.lineStyle(1.2 / this.view.scale, 0xe8590c, 1);
          g.moveTo(node.x, node.y).lineTo(cp.x, cp.y);
          g.lineStyle(0);
          this.fillCircle(g, cp.x, cp.y, (HANDLE_R - 1) / this.view.scale, 0xffffff);
          this.strokeCircle(g, cp.x, cp.y, (HANDLE_R - 1) / this.view.scale, 0xe8590c, 1.5 / this.view.scale);
        }
      });
      this.fillCircle(g, node.x, node.y, HANDLE_R / this.view.scale, 0x1d5a8c);
      this.strokeCircle(g, node.x, node.y, HANDLE_R / this.view.scale, 0xffffff, 1.5 / this.view.scale);
    });
  }

  private drawMarquee(): void {
    if (this.drag.kind !== 'marquee') return;
    const b = bboxOf([this.drag.startDoc, this.drag.currentDoc]);
    const g = this.overlay;
    g.beginFill(0x1d5a8c, 0.08);
    g.lineStyle(1 / this.view.scale, 0x1d5a8c, 1);
    g.drawRect(b.x, b.y, b.w, b.h);
    g.endFill();
    g.lineStyle(0);
  }

  private drawGuides(): void {
    const g = this.guideLayer;
    g.lineStyle(1.2 / this.view.scale, 0xe8590c, 0.95);
    for (const guide of this.guides) {
      g.moveTo(guide.from.x, guide.from.y).lineTo(guide.to.x, guide.to.y);
      this.fillCircle(g, guide.snapPoint.x, guide.snapPoint.y, 5 / this.view.scale, 0xe8590c);
    }
    g.lineStyle(0);
  }

  private drawAnnotations(): void {
    const annos: Annotation[] = uiState.annotations;
    const g = this.annotationLayer;
    for (const a of annos) {
      const color = a.status === 'resolved' ? 0x2f9e44 : 0xe03131;
      g.beginFill(color, 0.08);
      g.lineStyle(2 / this.view.scale, color, 1);
      this.tracePath(g, a.loop);
      g.endFill();
      g.lineStyle(0);
    }
    if (this.drag.kind === 'annotation') {
      const path = this.drag.path;
      g.lineStyle(2 / this.view.scale, 0xe03131, 1);
      g.moveTo(path.nodes[0].x, path.nodes[0].y);
      for (const n of path.nodes.slice(1)) g.lineTo(n.x, n.y);
      g.lineStyle(0);
    }
  }

  private drawCompare(): void {
    const versionId = uiState.compareVersionId;
    if (!versionId) return;
    const older = compareDocCache.get(versionId);
    if (!older) return;
    const g = this.compareLayer;
    const alpha = uiState.compareOpacity;
    for (const node of topLevelNodes(older)) {
      if (!node.visible) continue;
      for (const p of effectivePaths(older, node)) {
        g.beginFill(0xe8590c, alpha * 0.25);
        g.lineStyle(1.5 / this.view.scale, 0xd9480f, alpha);
        this.tracePath(g, p);
        g.endFill();
        g.lineStyle(0);
      }
    }
  }

  dispose(): void {
    this.disposed = true;
    const el = (this.app.view as HTMLCanvasElement).parentElement;
    el?.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    el?.removeEventListener('dblclick', this.onDblClick);
    el?.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.app.destroy(false, { children: true });
  }
}
