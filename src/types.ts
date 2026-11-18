// 核心领域模型：灯具 / 遮挡物 / 方案 / 批次质检

export type LampKind = 'uvb' | 'heat' | 'night' | 'led';
export type ObstacleKind = 'hide' | 'branch' | 'dish';
export type PeriodId = 'morning' | 'noon' | 'evening' | 'night';
export type Severity = 'critical' | 'major' | 'minor';
export type IssueStatus = 'open' | 'confirmed' | 'rejected';

export interface LampSpec {
  kind: LampKind;
  label: string;
  /** 参考距离 refDistance(cm) 处的轴上照度 lux */
  refLux: number;
  refDistance: number;
  /** 半光锥角（度） */
  halfAngleDeg: number;
  /** 线性光源长度（cm），0 表示点光源 */
  length: number;
  color: string;
  desc: string;
}

export interface Lamp {
  id: string;
  kind: LampKind;
  name: string;
  /** 光源中心 x(cm) */
  x: number;
  /** 光源中心 y(cm)，y 向上 */
  y: number;
  /** 光轴角度（度），-90 = 垂直向下 */
  angle: number;
  /** 输出功率倍率 0..1.5 */
  power: number;
  /** 四个时段的开关 */
  schedule: Record<PeriodId, boolean>;
}

export interface Obstacle {
  id: string;
  kind: ObstacleKind;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Plan {
  id: string;
  name: string;
  species: string;
  widthCm: number;
  heightCm: number;
  lamps: Lamp[];
  obstacles: Obstacle[];
}

export interface ZoneStats {
  index: number;
  name: string;
  x0: number;
  x1: number;
  avgLux: number;        // 全区平均
  floorLux: number;      // 地面 5cm 平均
  dark: boolean;         // avgLux < 200
  lampCount: number;
}

export interface FieldResult {
  cols: number;
  rows: number;
  cellW: number;
  cellH: number;
  /** 每行 rows 个值，长度 cols*rows */
  lux: Float32Array;
  /** 无遮挡直射分量，用于对比阴影损失 */
  directLux: Float32Array;
  maxLux: number;
  zones: ZoneStats[];
}

export interface QcIssue {
  id: string;
  planId: string;
  planName: string;
  severity: Severity;
  code: string;
  message: string;
  status: IssueStatus;
  period?: PeriodId;
  lampId?: string;
}

export interface BatchResult {
  batchId: string;
  importedAt: string;
  plans: Plan[];
  issues: QcIssue[];
  /** 放行 / 退回 */
  verdict: 'pending' | 'released' | 'returned';
}

export interface AppSettings {
  snap: boolean;
  gridCm: number;
  angleSnapDeg: number;
  showHeatmap: boolean;
  showCone: boolean;
}
