// 文档与领域模型 —— 所有状态都是可结构化克隆的纯数据，便于快照式历史栈

export type Pt = { x: number; y: number };

/** 路径节点：curve 段携带两个控制点（相对锚点的偏移，随锚点一起拖动） */
export interface PathNode {
  x: number;
  y: number;
  /** 控制点1/2相对锚点的偏移；直线段两者均为 0 */
  c1?: Pt;
  c2?: Pt;
}

export interface PathData {
  closed: boolean;
  nodes: PathNode[];
}

export type BooleanOp = 'union' | 'subtract' | 'intersect';

export interface StyleData {
  /** 填充色，null = 不填充 */
  fill: string | null;
  /** 描边色 */
  stroke: string | null;
  /** 描边宽度（文档坐标像素） */
  strokeWidth: number;
}

export interface BaseNode {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

export interface ShapeNode extends BaseNode {
  type: 'shape';
  /** 形状模板，仅用于新建时识别；自由编辑后仍保留 */
  kind: 'starfish' | 'jellyfish' | 'wave' | 'custom';
  path: PathData;
  style: StyleData;
  parentId: string | null;
}

export interface GroupNode extends BaseNode {
  type: 'group';
  parentId: string | null;
  /** 沿弧排布参数（可空表示普通组） */
  arcLayout?: ArcLayout | null;
}

export interface CompoundNode extends BaseNode {
  type: 'compound';
  op: BooleanOp;
  /** 参与运算的顶层形状/复合节点 id，顺序即选择顺序（差集时首个为被减主体） */
  childIds: string[];
  style: StyleData;
  parentId: string | null;
}

export type DocNode = ShapeNode | GroupNode | CompoundNode;
export type AnyNodeId = string;

/** 沿滑道弧长方向排布参数 */
export interface ArcLayout {
  /** 作为滑道中心线的开放路径节点 */
  rail: PathData;
  /** 相邻图形沿弧长的间距（像素） */
  spacing: number;
  /** 起始弧长偏移 */
  startOffset: number;
  /** 图形是否随切线旋转 */
  rotateToTangent: boolean;
  /** 每个成员在 rail 上的参数（弧长），长度与组内成员一致 */
  memberArcs: number[];
}

export interface Annotation {
  id: string;
  /** 批注圈选区域（文档坐标，开放手绘路径） */
  loop: PathData;
  text: string;
  author: string;
  createdAt: number;
  replies: Reply[];
  /** 处理状态（制作方逐条回复处理） */
  status: 'open' | 'resolved';
}

export interface Reply {
  id: string;
  author: string;
  text: string;
  createdAt: number;
}

export interface VersionRecord {
  id: string;
  label: string;
  note: string;
  createdAt: number;
  doc: SprayDoc;
  annotations: Annotation[];
}

export interface SprayDoc {
  /** 图层顺序：数组靠前 = 底层，渲染时从前往后画 */
  nodes: DocNode[];
  slideRail: PathData | null;
}

export interface EditorSnapshot {
  doc: SprayDoc;
  selection: string[];
}

export type ToolId =
  | 'select'
  | 'node'
  | 'pan'
  | 'starfish'
  | 'jellyfish'
  | 'wave'
  | 'annotate';

export interface ViewTransform {
  /** 缩放倍数 */
  scale: number;
  /** 文档坐标(0,0)在屏幕上的偏移 */
  tx: number;
  ty: number;
}
