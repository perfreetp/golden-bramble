// 全局编辑器状态：Solid store + 快照式历史栈（≥50步，钉住打开文件基线）
import { createSignal } from 'solid-js';
import { createStore, produce, type SetStoreFunction, type Store } from 'solid-js/store';
import type {
  Annotation,
  ArcLayout,
  BooleanOp,
  CompoundNode,
  DocNode,
  GroupNode,
  PathData,
  Reply,
  ShapeNode,
  SprayDoc,
  StyleData,
  ToolId,
  ViewTransform,
} from './types';
import { uid } from './lib/shape-factory';
import {
  childrenOf,
  centerPath,
  effectivePaths,
  getNode,
  nodeMap,
  ownedByCompound,
  shapeChildren,
  topLevelNodes,
} from './lib/doc-utils';
import { clone } from './lib/clone';
import { clonePath } from './lib/geometry';
import type { Pt } from './lib/geometry';
export type { Pt } from './lib/geometry';
import { loadAnnotations, loadProject, loadVersions, saveAnnotations, saveProject, saveVersions } from './lib/storage';

export const HISTORY_LIMIT = 200; // 远超“至少50步”

function emptyDoc(): SprayDoc {
  return { nodes: [], slideRail: null };
}

interface HistoryState {
  doc: SprayDoc;
  /** 历史栈，索引0为最旧；长度受 HISTORY_LIMIT 约束 */
  past: SprayDoc[];
  future: SprayDoc[];
  /** 打开文件时的基线（可连续回退的目标） */
  baseline: SprayDoc;
  fileName: string;
  dirty: boolean;
}

interface UIState {
  tool: ToolId;
  selection: string[];
  view: ViewTransform;
  snappingEnabled: boolean;
  /** 正在编辑复合节点时的上下文 */
  compoundEditId: string | null;
  /** 正在编辑弧排布组时的上下文 */
  groupEditId: string | null;
  /** 批注/版本 */
  annotations: Annotation[];
  versions: { id: string; label: string; note: string; createdAt: number }[];
  /** 版本对比：被叠加的旧版本 id */
  compareVersionId: string | null;
  /** 差异叠加透明度 */
  compareOpacity: number;
  currentUserName: string;
  reviewerName: string;
}

const initialProject = loadProject();

const [hist, setHist] = createStore<HistoryState>({
  doc: initialProject ? clone(initialProject.doc) : emptyDoc(),
  past: [],
  future: [],
  baseline: initialProject ? clone(initialProject.baseline) : emptyDoc(),
  fileName: initialProject?.fileName ?? '未命名项目',
  dirty: false,
});

const [ui, setUI] = createStore<UIState>({
  tool: 'select',
  selection: [],
  view: { scale: 1, tx: 80, ty: 60 },
  snappingEnabled: true,
  compoundEditId: null,
  groupEditId: null,
  annotations: loadAnnotations(),
  versions: loadVersions().map((v) => ({ id: v.id, label: v.label, note: v.note, createdAt: v.createdAt })),
  compareVersionId: null,
  compareOpacity: 0.45,
  currentUserName: '制作方',
  reviewerName: '审核人',
});

// 拖拽前的文档快照（拖动期间不入栈，松手时一次性入栈）
let dragSnapshot: SprayDoc | null = null;
let suppressAutosave = false;

export const docState: Store<HistoryState> = hist;
export const uiState: Store<UIState> = ui;
export const setDoc: SetStoreFunction<HistoryState> = setHist;
export const setUi: SetStoreFunction<UIState> = setUI;

// 调试/自动化钩子：headless 测试读取实时响应式状态（生产环境无副作用）
if (typeof window !== 'undefined') {
  (window as unknown as { __spray?: unknown }).__spray = {
    get doc() {
      return hist.doc;
    },
    get ui() {
      return ui;
    },
    updateLive,
    beginInteraction,
    endInteraction,
  };
}

// ---------- 派生信号 ----------

const [historyTick, setHistoryTick] = createSignal(0);
const bumpHistory = () => setHistoryTick((n) => n + 1);

export const canUndo = () => historyTick() >= 0 && hist.past.length > 0;
export const canRedo = () => hist.future.length > 0;
export const canRevertToBaseline = () =>
  JSON.stringify(hist.doc) !== JSON.stringify(hist.baseline);
export const undoDepth = () => hist.past.length;

// ---------- 历史提交 ----------

/** 提交一次文档变更；label 仅用于调试/历史提示 */
export function commit(label: string, mutate: (draft: SprayDoc) => void): void {
  void label;
  const before = clone(hist.doc);
  setHist(
    produce((h) => {
      mutate(h.doc);
    }),
  );
  setHist(
    produce((h) => {
      h.past.push(before);
      if (h.past.length > HISTORY_LIMIT) h.past.shift();
      h.future = [];
      h.dirty = true;
    }),
  );
  bumpHistory();
}

/** 拖拽开始：冻结快照 */
export function beginInteraction(): void {
  dragSnapshot = clone(hist.doc);
}

/** 拖拽过程中直接改文档（不入栈）。克隆后修改再整体替换 doc，确保 Solid 可靠追踪 */
export function updateLive(mutate: (draft: SprayDoc) => void): void {
  const draft = clone(hist.doc);
  mutate(draft);
  setHist('doc', draft);
}

/** 拖拽结束：把拖拽前快照一次性入栈 */
export function endInteraction(label: string): void {
  void label;
  if (!dragSnapshot) return;
  if (JSON.stringify(dragSnapshot) !== JSON.stringify(hist.doc)) {
    setHist(
      produce((h) => {
        h.past.push(dragSnapshot!);
        if (h.past.length > HISTORY_LIMIT) h.past.shift();
        h.future = [];
        h.dirty = true;
      }),
    );
    bumpHistory();
  }
  dragSnapshot = null;
}

export function undo(): void {
  if (!hist.past.length) return;
  const previous = hist.past[hist.past.length - 1];
  setHist(
    produce((h) => {
      h.past.pop();
      h.future.push(clone(h.doc));
      h.doc = previous;
      h.dirty = true;
    }),
  );
  pruneSelection();
  bumpHistory();
}

export function redo(): void {
  if (!hist.future.length) return;
  const next = hist.future[hist.future.length - 1];
  setHist(
    produce((h) => {
      h.future.pop();
      h.past.push(clone(h.doc));
      h.doc = next;
      h.dirty = true;
    }),
  );
  pruneSelection();
  bumpHistory();
}

/** 连续回退到打开文件时的基线状态 */
export function revertToBaseline(): void {
  if (!canRevertToBaseline()) return;
  const current = clone(hist.doc);
  setHist(
    produce((h) => {
      h.future.push(current);
      h.doc = clone(h.baseline);
      h.dirty = true;
    }),
  );
  setUI('selection', []);
  setUI('compoundEditId', null);
  setUI('groupEditId', null);
  bumpHistory();
}

function pruneSelection(): void {
  const ids = new Set(hist.doc.nodes.map((n) => n.id));
  setUI(
    produce((u) => {
      u.selection = u.selection.filter((id) => ids.has(id));
      if (u.compoundEditId && !ids.has(u.compoundEditId)) u.compoundEditId = null;
      if (u.groupEditId && !ids.has(u.groupEditId)) u.groupEditId = null;
    }),
  );
}

// ---------- 选择 ----------

export function setSelection(ids: string[]): void {
  setUI('selection', ids);
}
export function toggleSelection(id: string): void {
  setUI(
    produce((u) => {
      const i = u.selection.indexOf(id);
      if (i >= 0) u.selection.splice(i, 1);
      else u.selection.push(id);
    }),
  );
}

// ---------- 形状增删改 ----------

export function addShape(
  kind: ShapeNode['kind'],
  path: PathData,
  style: StyleData,
  at?: Pt,
): string {
  const id = uid('shape');
  const placed: PathData = at
    ? { ...path, nodes: path.nodes.map((n) => ({ ...n, x: n.x + at.x, y: n.y + at.y, c1: n.c1 ? { ...n.c1 } : undefined, c2: n.c2 ? { ...n.c2 } : undefined })) }
    : path;
  commit('添加图形', (d) => {
    d.nodes.push({
      id,
      type: 'shape',
      name: shapeLabel(kind, d.nodes),
      visible: true,
      locked: false,
      kind,
      path: placed,
      style: clone(style),
      parentId: null,
    });
  });
  setUI('selection', [id]);
  return id;
}

function shapeLabel(kind: ShapeNode['kind'], nodes: DocNode[]): string {
  const base = kind === 'starfish' ? '海星' : kind === 'jellyfish' ? '水母' : '浪花';
  const count = nodes.filter((n) => n.type === 'shape' && n.kind === kind).length + 1;
  return `${base} ${count}`;
}

export function deleteSelected(): void {
  const sel = new Set(ui.selection);
  if (!sel.size) return;
  commit('删除', (d) => {
    // 连带删除组/复合的子孙与参与节点
    const toDelete = new Set(sel);
    let grew = true;
    while (grew) {
      grew = false;
      for (const n of d.nodes) {
        if (toDelete.has(n.id)) continue;
        const parent = (n as ShapeNode).parentId;
        if (parent && toDelete.has(parent)) {
          toDelete.add(n.id);
          grew = true;
        }
        if (n.type === 'compound' && n.childIds.some((c) => toDelete.has(c))) {
          toDelete.add(n.id);
          grew = true;
        }
      }
    }
    d.nodes = d.nodes.filter((n) => !toDelete.has(n.id));
  });
  setUI('selection', []);
  setUI('compoundEditId', null);
  setUI('groupEditId', null);
}

export function duplicateSelected(): void {
  const sel = [...ui.selection];
  if (!sel.length) return;
  const idMap = new Map<string, string>();
  commit('复制', (d) => {
    const copies: DocNode[] = [];
    for (const id of sel) {
      const n = d.nodes.find((x) => x.id === id);
      if (!n) continue;
      const copy = clone(n);
      const newId = uid(n.type);
      idMap.set(id, newId);
      copy.id = newId;
      copy.name = `${n.name} 副本`;
      if (copy.type === 'shape') {
        copy.path = {
          ...copy.path,
          nodes: copy.path.nodes.map((nd) => ({ ...nd, x: nd.x + 24, y: nd.y + 24 })),
        };
      }
      if (copy.type === 'compound') {
        copy.childIds = copy.childIds.map((c) => idMap.get(c) ?? c);
      }
      copies.push(copy);
    }
    // 修复组内 parentId
    for (const c of copies) {
      const p = (c as ShapeNode).parentId;
      if (p && idMap.has(p)) (c as ShapeNode).parentId = idMap.get(p)!;
    }
    d.nodes.push(...copies);
  });
  setUI('selection', [...idMap.values()]);
}

// ---------- 图层属性 ----------

export function renameNode(id: string, name: string): void {
  commit('重命名', (d) => {
    const n = d.nodes.find((x) => x.id === id);
    if (n) n.name = name;
  });
}

export function toggleLock(id: string): void {
  commit('锁定切换', (d) => {
    const n = d.nodes.find((x) => x.id === id);
    if (n) n.locked = !n.locked;
  });
}

export function toggleVisible(id: string): void {
  commit('可见切换', (d) => {
    const n = d.nodes.find((x) => x.id === id);
    if (n) n.visible = !n.visible;
  });
}

export type LayerMove = 'up' | 'down' | 'top' | 'bottom';

export function moveLayer(id: string, dir: LayerMove): void {
  commit('调整图层顺序', (d) => {
    const i = d.nodes.findIndex((n) => n.id === id);
    if (i < 0) return;
    const [node] = d.nodes.splice(i, 1);
    if (dir === 'up') d.nodes.splice(Math.min(d.nodes.length, i + 1), 0, node);
    else if (dir === 'down') d.nodes.splice(Math.max(0, i - 1), 0, node);
    else if (dir === 'top') d.nodes.push(node);
    else d.nodes.unshift(node);
  });
}

// ---------- 节点级编辑（路径锚点/控制点） ----------

/** 在段中点插入节点（直线段 → 新锚点无控制柄）；锚点/控制柄拖拽在 pixi-stage 内经 updateLive 处理 */
export function insertNodeOnSegment(shapeId: string, nodeIndex: number, at: Pt): void {
  commit('插入节点', (d) => {
    const n = d.nodes.find((x) => x.id === shapeId);
    if (n?.type !== 'shape') return;
    const path = n.path;
    const insertAt = (nodeIndex + 1) % path.nodes.length;
    path.nodes.splice(insertAt, 0, { x: at.x, y: at.y });
  });
}

// ---------- 样式 ----------

export function updateStyle(id: string, patch: Partial<StyleData>): void {
  commit('样式修改', (d) => {
    const n = d.nodes.find((x) => x.id === id);
    if (n && (n.type === 'shape' || n.type === 'compound')) {
      Object.assign(n.style, patch);
    }
  });
}

// ---------- 编组与弧排布 ----------

export interface ArcOptions {
  spacing: number;
  startOffset: number;
  rotateToTangent: boolean;
}

export function groupSelected(opts?: ArcOptions): string | null {
  const sel = ui.selection.filter((id) => {
    const n = getNode(hist.doc, id);
    return n && n.type === 'shape' && !n.locked && !(n as ShapeNode).parentId;
  });
  if (sel.length < 2) return null;
  const groupId = uid('group');
  commit('编组', (d) => {
    const group: GroupNode = {
      id: groupId,
      type: 'group',
      name: `组 ${d.nodes.filter((n) => n.type === 'group').length + 1}`,
      visible: true,
      locked: false,
      parentId: null,
      arcLayout: null,
    };
    d.nodes.push(group);
    for (const id of sel) {
      const n = d.nodes.find((x) => x.id === id);
      if (n?.type === 'shape') n.parentId = groupId;
    }
  });
  setUI('selection', [groupId]);
  if (opts) applyArcLayout(groupId, opts);
  return groupId;
}

export function ungroupSelected(): void {
  const groups = ui.selection
    .map((id) => getNode(hist.doc, id))
    .filter((n): n is GroupNode => !!n && n.type === 'group');
  if (!groups.length) return;
  commit('解组', (d) => {
    const ids = new Set(groups.map((g) => g.id));
    for (const n of d.nodes) {
      if ((n as ShapeNode).parentId && ids.has((n as ShapeNode).parentId!)) {
        (n as ShapeNode).parentId = null;
      }
    }
    d.nodes = d.nodes.filter((n) => !ids.has(n.id));
  });
  setUI('selection', []);
  setUI('groupEditId', null);
}

/** 沿滑道弧长方向排布组成员 */
export function applyArcLayout(groupId: string, opts: ArcOptions): void {
  commit('沿弧排布', (d) => {
    const group = d.nodes.find((n) => n.id === groupId);
    if (!group || group.type !== 'group') return;
    const members = d.nodes.filter(
      (n) => n.type === 'shape' && (n as ShapeNode).parentId === groupId,
    ) as ShapeNode[];
    // 成员路径先归一化到以自身中心为原点，避免原始坐标叠加导致全部挤在一起
    for (const m of members) m.path = centerPath(m.path);
    const rail = d.slideRail ?? buildDefaultRail(members, opts.spacing, opts.startOffset);
    const memberArcs = members.map((_, i) => opts.startOffset + i * opts.spacing);
    const layout: ArcLayout = {
      rail: clonePath(rail),
      spacing: opts.spacing,
      startOffset: opts.startOffset,
      rotateToTangent: opts.rotateToTangent,
      memberArcs,
    };
    group.arcLayout = layout;
    if (!d.slideRail) d.slideRail = clonePath(rail);
  });
}

/** 修改间距/偏移/切线旋转后重排（保留各成员顺序） */
export function updateArcLayout(groupId: string, patch: Partial<ArcOptions>): void {
  commit('调整弧排布', (d) => {
    const group = d.nodes.find((n) => n.id === groupId);
    if (!group || group.type !== 'group' || !group.arcLayout) return;
    Object.assign(group.arcLayout, patch);
    const layout = group.arcLayout;
    layout.memberArcs = layout.memberArcs.map((_, i) => layout.startOffset + i * layout.spacing);
  });
}

export function removeArcLayout(groupId: string): void {
  commit('取消弧排布', (d) => {
    const group = d.nodes.find((n) => n.id === groupId);
    if (group?.type === 'group') group.arcLayout = null;
  });
}

function buildDefaultRail(members: ShapeNode[], spacing: number, startOffset: number): PathData {
  const count = Math.max(members.length, 1);
  // 滑道长度覆盖全部成员的弧长落点，并在两端留白
  const length = startOffset + (count - 1) * spacing + 320;
  // 成员已居中到原点；滑道放在文档可视区（与默认视图偏移匹配），避免落到视口外
  const x0 = 120;
  const y0 = 320;
  return {
    closed: false,
    nodes: [
      { x: x0, y: y0 },
      {
        x: x0 + length / 2,
        y: y0 - 70,
        c1: { x: length / 8, y: 0 },
        c2: { x: -length / 8, y: 0 },
      },
      { x: x0 + length, y: y0 },
    ],
  };
}

// ---------- 布尔运算（复合节点：保留源路径节点，实时求值） ----------

export function createCompoundFromSelection(op: BooleanOp): string | null {
  const sel = ui.selection.filter((id) => {
    const n = getNode(hist.doc, id);
    return n && (n.type === 'shape' || n.type === 'compound') && !n.locked;
  });
  if (sel.length < 2) return null;
  const id = uid('compound');
  commit(`布尔${op}`, (d) => {
    const first = d.nodes.find((n) => n.id === sel[0]);
    const baseStyle =
      first && (first.type === 'shape' || first.type === 'compound')
        ? clone(first.style)
        : { fill: '#2f7fc1', stroke: '#0f3a5f', strokeWidth: 3 };
    const compound: CompoundNode = {
      id,
      type: 'compound',
      name: op === 'union' ? '并集' : op === 'subtract' ? '差集' : '交集',
      visible: true,
      locked: false,
      op,
      childIds: [...sel],
      style: baseStyle,
      parentId: null,
    };
    d.nodes.push(compound);
  });
  setUI('selection', [id]);
  return id;
}

export function changeCompoundOp(id: string, op: BooleanOp): void {
  commit('修改布尔运算', (d) => {
    const n = d.nodes.find((x) => x.id === id);
    if (n?.type === 'compound') {
      n.op = op;
      n.name = op === 'union' ? '并集' : op === 'subtract' ? '差集' : '交集';
    }
  });
}

/** 分离复合节点：删除复合壳，源节点恢复为顶层 */
export function releaseCompound(id: string): void {
  commit('分离布尔', (d) => {
    d.nodes = d.nodes.filter((n) => n.id !== id);
  });
  setUI('compoundEditId', null);
  setUI('selection', []);
}

/** 烘焙：把当前求值结果固化为普通形状，源节点归档删除 */
export function bakeCompound(id: string): void {
  const compound = getNode(hist.doc, id) as CompoundNode | undefined;
  if (!compound || compound.type !== 'compound') return;
  const paths = effectivePaths(hist.doc, compound);
  commit('烘焙布尔结果', (d) => {
    paths.forEach((p, i) => {
      d.nodes.push({
        id: uid('shape'),
        type: 'shape',
        name: `${compound.name} 结果${paths.length > 1 ? i + 1 : ''}`,
        visible: true,
        locked: false,
        kind: 'custom',
        path: clone(p),
        style: clone(compound.style),
        parentId: null,
      });
    });
    const remove = new Set<string>([id, ...compound.childIds]);
    d.nodes = d.nodes.filter((n) => !remove.has(n.id));
  });
  setUI('compoundEditId', null);
  setUI('selection', []);
}

// ---------- 批注（审核人圈选 + 制作方回复） ----------

export function addAnnotation(loop: PathData, text: string, author: string): string {
  const id = uid('anno');
  const anno: Annotation = {
    id,
    loop,
    text,
    author,
    createdAt: Date.now(),
    replies: [],
    status: 'open',
  };
  setUI(
    produce((u) => {
      u.annotations.push(anno);
    }),
  );
  persistAnnotations();
  return id;
}

export function replyAnnotation(annoId: string, text: string, author: string): void {
  const reply: Reply = { id: uid('reply'), author, text, createdAt: Date.now() };
  setUI(
    produce((u) => {
      const a = u.annotations.find((x) => x.id === annoId);
      if (a) a.replies.push(reply);
    }),
  );
  persistAnnotations();
}

export function resolveAnnotation(annoId: string): void {
  setUI(
    produce((u) => {
      const a = u.annotations.find((x) => x.id === annoId);
      if (a) a.status = a.status === 'open' ? 'resolved' : 'open';
    }),
  );
  persistAnnotations();
}

export function deleteAnnotation(annoId: string): void {
  setUI(
    produce((u) => {
      u.annotations = u.annotations.filter((a) => a.id !== annoId);
    }),
  );
  persistAnnotations();
}

function persistAnnotations(): void {
  saveAnnotations(ui.annotations);
}

// ---------- 版本：每次提交生成新版本 ----------

export function commitVersion(label: string, note: string): import('./types').VersionRecord {
  const versions = loadVersions();
  const record: import('./types').VersionRecord = {
    id: uid('ver'),
    label: label || `v${versions.length + 1}`,
    note,
    createdAt: Date.now(),
    doc: clone(hist.doc),
    annotations: clone(ui.annotations),
  };
  versions.push(record);
  saveVersions(versions);
  setUI(
    produce((u) => {
      u.versions = versions.map((v) => ({ id: v.id, label: v.label, note: v.note, createdAt: v.createdAt }));
    }),
  );
  return record;
}

export function getVersionRecord(id: string) {
  return loadVersions().find((v) => v.id === id) ?? null;
}

export function setCompareVersion(id: string | null): void {
  setUI('compareVersionId', id);
}

// ---------- 文件 ----------

export function saveFile(fileName?: string): void {
  const name = fileName ?? hist.fileName;
  saveProject({
    fileName: name,
    savedAt: Date.now(),
    doc: clone(hist.doc),
    baseline: clone(hist.baseline),
  });
  setHist('fileName', name);
  setHist('dirty', false);
}

export function openFile(file: { fileName: string; doc: SprayDoc; baseline?: SprayDoc }): void {
  suppressAutosave = true;
  setHist({
    doc: clone(file.doc),
    baseline: clone(file.baseline ?? file.doc),
    past: [],
    future: [],
    fileName: file.fileName,
    dirty: false,
  });
  setUI('selection', []);
  setUI('compoundEditId', null);
  setUI('groupEditId', null);
  setUI('compareVersionId', null);
  bumpHistory();
  queueMicrotask(() => {
    suppressAutosave = false;
  });
}

export function newFile(): void {
  openFile({ fileName: `未命名项目 ${new Date().toLocaleDateString()}`, doc: emptyDoc() });
  saveVersions([]);
  saveAnnotations([]);
  setUI('annotations', []);
  setUI('versions', []);
  setUI('compareVersionId', null);
}

export function exportProjectFile(): { fileName: string; doc: SprayDoc; baseline: SprayDoc; annotations: Annotation[] } {
  return {
    fileName: hist.fileName,
    doc: clone(hist.doc),
    baseline: clone(hist.baseline),
    annotations: clone(ui.annotations),
  };
}

// ---------- 自动保存（防抖） ----------

let autosaveTimer: ReturnType<typeof setTimeout> | undefined;
export function scheduleAutosave(): void {
  if (suppressAutosave) return;
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    saveProject({
      fileName: hist.fileName,
      savedAt: Date.now(),
      doc: clone(hist.doc),
      baseline: clone(hist.baseline),
    });
    setHist('dirty', false);
  }, 800);
}

// ---------- 选择辅助 ----------

export function isLocked(id: string): boolean {
  const n = getNode(hist.doc, id);
  return !!n?.locked;
}

export function selectableTopLevel(): DocNode[] {
  return topLevelNodes(hist.doc);
}

export { childrenOf, effectivePaths, getNode, nodeMap, ownedByCompound, shapeChildren, topLevelNodes };
