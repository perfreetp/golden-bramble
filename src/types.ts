// 全局领域类型定义

/** 半剖轮廓控制点：r = 径向半径(mm)，z = 高度(mm)，轴为 z 轴，r >= 0 */
export interface ProfilePoint {
  id: string;
  r: number;
  z: number;
}

/** 密集采样点（含曲率与切向角） */
export interface SamplePoint {
  r: number;
  z: number;
  /** 曲率 1/mm */
  kappa: number;
  /** 切向角（相对 +z 轴，度） */
  theta: number;
}

export interface RZ {
  r: number;
  z: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface RevolvedMesh {
  vertices: Vec3[];
  rings: number; // 每环顶点数（周向分段）
  rows: number; // 轴向采样行数
}

/** 偏移曲线（标签安全区/出血边界） */
export interface OffsetCurve {
  points: { r: number; z: number }[];
  kind: 'safe' | 'bleed';
  /** 实际平均法向偏移量 mm */
  distance: number;
}

/** 展开稿每一行（高度方向切片）的统计量 */
export interface UnrollRow {
  z: number;
  r: number;
  /** 该行周向展开弧长 mm */
  width: number;
  /** 相对参考半径周长的伸长率（百分比） */
  elongation: number;
}

export interface ProfileDraft {
  points: ProfilePoint[];
  label: { zMin: number; zMax: number };
  offsets: {
    /** 安全区内缩量 mm */
    safe: number;
    /** 出血外扩量 mm */
    bleed: number;
  };
  /** 曲率告警阈值 1/mm */
  curvatureLimit: number;
}

export type Role = 'frontdesk' | 'designer' | 'qc' | 'manager';

export type OrderStatus =
  | 'received' // 已接单待分派
  | 'assigned' // 已分派设计中
  | 'submitted' // 设计已提交待质检
  | 'passed' // 质检通过
  | 'rework'; // 质检打回，返工中

export interface HistoryEntry {
  t: number;
  action: string;
  by: string;
}

export interface WorkOrder {
  id: string;
  code: string;
  title: string;
  /** 目标容量 ml */
  capacity: number;
  material: string;
  customer: string;
  status: OrderStatus;
  assignee: string | null;
  createdAt: number;
  reworkCount: number;
  history: HistoryEntry[];
  /** 设计稿（提交时生成/更新） */
  draft: ProfileDraft | null;
  /** 提交时计算的指标快照 */
  metrics: {
    volumeMl: number;
    labelWidthMm: number;
    labelHeightMm: number;
    maxElongationPct: number;
  } | null;
  /** 质检打回原因 */
  lastRejectReason: string | null;
  qcChecks: { curvature: boolean; seam: boolean; elongation: boolean } | null;
}
