// 全局类型定义

export type LayerId = 'base' | 'lane' | 'pile' | 'sign' | 'device';

export interface LayerMeta {
  id: LayerId;
  name: string;
  color: number;
  /** 图层排序与 z 轴抬升 */
  z: number;
  description: string;
}

export const LAYERS: LayerMeta[] = [
  { id: 'base', name: '底图', color: 0x6b7280, z: 0, description: '建筑、硬化地面、绿化与围墙轮廓' },
  { id: 'lane', name: '车道', color: 0xf5f5f4, z: 0.05, description: '车道线、库位线、导向箭头等线划要素' },
  { id: 'pile', name: '桩位', color: 0xf97316, z: 0.12, description: '科二训练用标杆、感应桩与限位桩' },
  { id: 'sign', name: '标志', color: 0x38bdf8, z: 0.14, description: '标志牌、指示牌与科目告示牌' },
  { id: 'device', name: '设备', color: 0xa78bfa, z: 0.16, description: '照明杆、监控摄像头与信号设备' },
];

export const LAYER_MAP: Record<LayerId, LayerMeta> = Object.fromEntries(
  LAYERS.map((l) => [l.id, l]),
) as Record<LayerId, LayerMeta>;

/** 点符号种类 */
export type PointKind =
  // 桩位
  | 'pole'        // 训练标杆
  | 'sensor'      // 感应桩
  | 'limit'       // 限位桩
  // 标志
  | 'signWarn'    // 警告标志
  | 'signOrder'   // 指示/禁令标志
  | 'signBoard'   // 科目告示牌
  // 设备
  | 'lamp'        // 照明杆
  | 'camera'      // 监控点
  | 'signal';     // 信号设备

/** 面要素种类(底图) */
export type AreaKind = 'building' | 'pavement' | 'green' | 'wall' | 'bay';

/** 线要素种类(车道) */
export type LineKind = 'solid' | 'dashed' | 'edge' | 'stop' | 'guide';

export type FeatureGeom =
  | { type: 'point'; x: number; z: number; rot?: number; size?: number }
  | { type: 'line'; points: [number, number][] }
  | { type: 'area'; points: [number, number][]; kind: AreaKind };

export interface Feature {
  id: string;
  layer: LayerId;
  kind: PointKind | LineKind | AreaKind;
  name: string;
  geom: FeatureGeom;
  /** 标注文字,空串表示不单独标注 */
  label: string;
  /** 业务属性(编号、规格、备注等) */
  attrs: Record<string, string>;
  /** 局部可见性覆盖;null 表示跟随图层 */
  visible: boolean | null;
}

/** 空间索引单元(网格分块) */
export interface GridCell {
  cx: number;
  cz: number;
  featureIds: string[];
}

// ---------- 任务 / 提交 / 成绩 ----------

export interface TaskFeatureRef {
  featureId: string;
  layer: LayerId;
}

export interface Task {
  id: string;
  title: string;
  subject: string;
  requirement: string;
  pileIds: string[];
  laneIds: string[];
  createdAt: number;
  creator: string;
}

export interface Placement {
  featureId: string;
  layer: LayerId;
  /** 学员摆放坐标(米,场地坐标系) */
  x: number;
  z: number;
}

export interface ScoreItem {
  featureId: string;
  name: string;
  layer: LayerId;
  /** 偏差距离,米 */
  deviation: number;
  /** 系统初步得分 0-100 */
  autoScore: number;
  /** 教练复核得分,null 表示未复核 */
  finalScore: number | null;
  /** 教练评语 */
  comment: string;
}

export interface Submission {
  id: string;
  taskId: string;
  student: string;
  placements: Placement[];
  pileScores: ScoreItem[];
  laneScores: ScoreItem[];
  autoTotal: number;
  finalTotal: number | null;
  reviewed: boolean;
  reviewComment: string;
  submittedAt: number;
}

export interface Student {
  id: string;
  name: string;
  classNo: string;
}
