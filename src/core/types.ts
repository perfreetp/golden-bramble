/** 核心领域类型 */

export interface Vec2 {
  x: number;
  y: number;
}

export type PartKind =
  | 'base' | 'waist' | 'head'
  | 'upperArm' | 'forearm' | 'wrist' | 'gripper';

export interface RotationLimit {
  enabled: boolean;
  /** 局部角下限（度） */
  min: number;
  /** 局部角上限（度） */
  max: number;
}

export interface Bone {
  id: string;
  name: string;
  part: PartKind;
  parentId: string | null;
  /** 像素长度 */
  length: number;
  /** 静止姿态下的局部角（度，0 = 沿 +x 方向） */
  restAngle: number;
  limit: RotationLimit;
  /** 渲染色 0xRRGGBBAA */
  color: RGBA;
  /** 部件尺寸（渲染用） */
  thickness: number;
}

export type EasingKind = 'linear' | 'easeInOut' | 'bezier';

/** 三次贝塞尔手柄，x/y 均在 [0,1] 空间（类似 CSS cubic-bezier） */
export interface BezierHandle {
  x1: number; y1: number;
  x2: number; y2: number;
}

export interface Keyframe {
  id: string;
  boneId: string;
  frame: number;
  /** 局部旋转角（度） */
  angle: number;
  easing: EasingKind;
  bezier?: BezierHandle;
}

export interface Project {
  id: string;
  taskId: string;
  studentId: string;
  name: string;
  fps: number;
  frameCount: number;
  skeleton: Bone[];
  keyframes: Keyframe[];
  updatedAt: number;
  submitted: boolean;
}

export interface Rubric {
  /** 最少关键帧数 */
  minKeyframes: number;
  /** 至少覆盖的关节角度范围（度） */
  angleRangeDeg: number;
  /** 目标时长（秒） */
  durationSec: number;
  /** 相邻帧角速度差跳变阈值（度/帧） */
  jumpTolerance: number;
}

export interface Task {
  id: string;
  title: string;
  desc: string;
  rubric: Rubric;
  deadline: string;
  createdAt: number;
}

export interface AutoScoreItem {
  label: string;
  /** 本项满分 */
  max: number;
  /** 实得分 */
  got: number;
  detail: string;
}

export interface Submission {
  id: string;
  projectId: string;
  taskId: string;
  studentId: string;
  klassId: string;
  status: 'submitted' | 'reviewed';
  autoScore: number;
  autoMax: number;
  autoItems: AutoScoreItem[];
  /** 自动检测的跳变帧（帧号） */
  jumpFrames: number[];
  teacherScore: number | null;
  teacherMax: number;
  /** 错题标签 */
  errors: string[];
  teacherComment: string;
  submittedAt: number;
  reviewedAt: number | null;
}

export interface Student {
  id: string;
  name: string;
}

export interface Klass {
  id: string;
  name: string;
  students: Student[];
}

export type Role = 'student' | 'teacher';

/** 渲染图元颜色为 0xRRGGBBAA */
export type RGBA = number;

export interface Camera {
  /** 世界坐标平移（屏幕像素） */
  x: number;
  y: number;
  zoom: number;
}
