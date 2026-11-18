// 核心领域模型 —— 所有长度单位均为毫米(mm)，角度为度(°)

export type UnitType = 'steps' | 'ramp' | 'posts' | 'bridge' | 'gravel';

export interface Vec2 {
  x: number;
  z: number;
}

/** 各障碍单元的类型相关参数 */
export interface UnitParams {
  // 台阶 steps
  stepCount?: number; // 级数
  stepHeight?: number; // 单级高度 mm
  stepDepth?: number; // 单级踏面深度 mm
  // 斜坡 ramp
  incline?: number; // 坡度角 °
  rampHeight?: number; // 坡顶高度 mm
  // 梅花桩 posts
  postRows?: number; // 排数
  postCols?: number; // 每排桩数
  postHeight?: number; // 桩高 mm
  postSpacing?: number; // 桩中心间距 mm
  // 窄桥 bridge
  bridgeHeight?: number; // 桥面离地 mm
  // 碎石地 gravel
  stoneCount?: number; // 碎石块数
  maxStoneSize?: number; // 最大石块尺寸 mm
  roughness?: number; // 起伏度 0~1
}

export interface ObstacleUnit {
  id: string;
  type: UnitType;
  /** 场地坐标系内的位置（单元包围盒中心，mm） */
  position: Vec2;
  /** 绕 Y 轴旋转角，度（0/90/180/270，自由旋转时可为任意值） */
  rotation: number;
  /** 占地矩形尺寸（未旋转时沿 x / z） */
  size: { w: number; d: number; h: number };
  params: UnitParams;
  locked: boolean;
  /** 生成该单元所用的随机序号，保证同种子同序列可复现 */
  rngIndex: number;
}

export interface FieldConfig {
  length: number; // 场地长 (x 方向) mm
  width: number; // 场地宽 (z 方向) mm
  difficulty: number; // 难度系数 0.1 ~ 1.0
  seed: number; // 整数种子
  /** 障碍序列，按顺序生成；支持重复类型 */
  sequence: UnitType[];
}

export interface FieldState {
  config: FieldConfig;
  units: ObstacleUnit[];
  /** 下一个单元 id 序号 */
  nextId: number;
}

/** 学员提交的机器人方案参数 */
export interface RobotPlan {
  maxClimbHeight: number; // 最大可越障高度 mm
  maxIncline: number; // 最大可爬坡角度 °
  minChannelWidth: number; // 所需最小通道宽度 mm
  wheelRadius: number; // 轮径/履带轮半径 mm
  baseWidth: number; // 车体宽度 mm
  baseLength: number; // 车体长度 mm
  notes?: string; // 方案说明
}

export interface CheckResult {
  unitId: string;
  unitType: UnitType;
  passed: boolean;
  /** 关键判据，例如 坡度 24° > 限值 20° */
  detail: string;
}

export interface AutoEvaluation {
  checks: CheckResult[];
  passedCount: number;
  totalCount: number;
  /** 自动判分 0~70 */
  autoScore: number;
}

export interface Submission {
  id: string;
  problemId: string;
  fieldSnapshot: FieldState;
  studentName: string;
  teamName: string;
  plan: RobotPlan;
  evaluation: AutoEvaluation;
  /** 教师复核分 0~30，null 表示尚未复核 */
  reviewScore: number | null;
  reviewComment: string;
  createdAt: number;
  reviewedAt: number | null;
}

export interface Problem {
  id: string;
  title: string;
  field: FieldState;
  createdAt: number;
}

export const UNIT_LABELS: Record<UnitType, string> = {
  steps: '台阶',
  ramp: '斜坡',
  posts: '梅花桩',
  bridge: '窄桥',
  gravel: '碎石地',
};

export const ALL_UNIT_TYPES: UnitType[] = ['steps', 'ramp', 'posts', 'bridge', 'gravel'];
