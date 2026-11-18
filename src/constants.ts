import type { LampKind, LampSpec, PeriodId, Plan, Lamp, Obstacle } from './types';

export const LAMP_LIBRARY: LampSpec[] = [
  {
    kind: 'uvb',
    label: 'UVB 灯管',
    refLux: 1200,
    refDistance: 30,
    halfAngleDeg: 55,
    length: 45,
    color: '#7dd3fc',
    desc: 'T5 长条 UVB，线性光源，覆盖晒背区，建议距晒点 25–35cm'
  },
  {
    kind: 'heat',
    label: '加热灯',
    refLux: 9000,
    refDistance: 25,
    halfAngleDeg: 32,
    length: 0,
    color: '#fb923c',
    desc: '聚光晒背灯，中心照度高、锥角窄，制造晒点热点'
  },
  {
    kind: 'night',
    label: '夜灯',
    refLux: 260,
    refDistance: 30,
    halfAngleDeg: 48,
    length: 0,
    color: '#a78bfa',
    desc: '弱光月光灯，夜间低照度取暖，不应超过 50 lux 环境亮度'
  },
  {
    kind: 'led',
    label: 'LED 灯带',
    refLux: 700,
    refDistance: 35,
    halfAngleDeg: 60,
    length: 60,
    color: '#fde68a',
    desc: '全光谱 LED 灯带，提供环境基础照度与观赏照明'
  }
];

export function specOf(kind: LampKind): LampSpec {
  return LAMP_LIBRARY.find(s => s.kind === kind)!;
}

export interface PeriodDef {
  id: PeriodId;
  label: string;
  time: string;
  sky: string; // 背景天色
  ambient: number; // 环境光 lux（无灯时的底照）
}

export const PERIODS: PeriodDef[] = [
  { id: 'morning', label: '早晨', time: '07:00', sky: '#fde8d0', ambient: 120 },
  { id: 'noon', label: '正午', time: '12:00', sky: '#e8f3ff', ambient: 260 },
  { id: 'evening', label: '傍晚', time: '18:00', sky: '#f3d9c8', ambient: 90 },
  { id: 'night', label: '夜间', time: '23:00', sky: '#1e2540', ambient: 8 }
];

/** 新灯各时段的默认开关组合 */
export const DEFAULT_SCHEDULE: Record<LampKind, Record<PeriodId, boolean>> = {
  uvb:   { morning: true,  noon: true,  evening: false, night: false },
  heat:  { morning: true,  noon: true,  evening: true,  night: false },
  night: { morning: false, noon: false, evening: true,  night: true  },
  led:   { morning: true,  noon: true,  evening: true,  night: false }
};

export const DARK_THRESHOLD = 200;
export const NIGHT_LIGHT_LIMIT = 50;

let seq = 0;
export function uid(prefix = 'id'): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

export function createLamp(kind: LampKind, x: number, y: number): Lamp {
  return {
    id: uid('lamp'),
    kind,
    name: specOf(kind).label,
    x,
    y,
    angle: -90,
    power: 1,
    schedule: { ...DEFAULT_SCHEDULE[kind] }
  };
}

let obsSeq = 0;
export function createObstacle(kind: Obstacle['kind'], x: number, y: number): Obstacle {
  obsSeq += 1;
  const presets: Record<Obstacle['kind'], { name: string; w: number; h: number }> = {
    hide: { name: `躲避穴 ${obsSeq}`, w: 22, h: 12 },
    branch: { name: `树枝 ${obsSeq}`, w: 28, h: 4 },
    dish: { name: `水盆 ${obsSeq}`, w: 16, h: 5 }
  };
  const p = presets[kind];
  return { id: uid('obs'), kind, ...p, x, y };
}

export function createSamplePlan(): Plan {
  return {
    id: uid('plan'),
    name: '鬃狮蜥 90cm 饲养箱',
    species: '鬃狮蜥',
    widthCm: 90,
    heightCm: 45,
    lamps: [
      { id: uid('lamp'), kind: 'uvb', name: 'UVB 灯管', x: 45, y: 41, angle: -90, power: 1,
        schedule: { ...DEFAULT_SCHEDULE.uvb } },
      { id: uid('lamp'), kind: 'heat', name: '加热灯', x: 66, y: 41, angle: -90, power: 1,
        schedule: { ...DEFAULT_SCHEDULE.heat } },
      { id: uid('lamp'), kind: 'led', name: 'LED 灯带', x: 25, y: 42, angle: -90, power: 0.8,
        schedule: { ...DEFAULT_SCHEDULE.led } },
      { id: uid('lamp'), kind: 'night', name: '夜灯', x: 14, y: 41, angle: -90, power: 0.12,
        schedule: { ...DEFAULT_SCHEDULE.night } }
    ],
    obstacles: [
      { id: uid('obs'), kind: 'hide', name: '躲避穴 1', x: 16, y: 6, w: 22, h: 12 },
      { id: uid('obs'), kind: 'branch', name: '树枝 1', x: 55, y: 16, w: 28, h: 4 },
      { id: uid('obs'), kind: 'dish', name: '水盆 1', x: 72, y: 2.5, w: 16, h: 5 }
    ]
  };
}
