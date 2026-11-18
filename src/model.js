// 营地布光工具：数据模型与常量

// ---- 画布几何 ----
export const CANVAS = { w: 1000, h: 660 }
export const GRID = 20 // 吸附网格
export const SNAP_DIST = 18 // 边线吸附距离(世界单位)

// ---- 灯具库 ----
// sourceSize: 发光面等效直径(m)，决定半影宽度
// defaultBeam: 默认光束角(度, 全角)
export const LAMP_CATALOG = {
  garden: {
    type: 'garden',
    name: '庭院灯',
    icon: '🏮',
    powerRange: [15, 80],
    defaultPower: 30,
    heightRange: [2.0, 4.5],
    defaultHeight: 3.0,
    radiusRange: [4, 16],
    defaultRadius: 9,
    beamRange: [60, 150],
    defaultBeam: 110,
    sourceSize: 0.25,
    efficacy: 85, // lm/W
    wallMount: false,
    color: '#ffd9a0',
  },
  flood: {
    type: 'flood',
    name: '投光灯',
    icon: '📡',
    powerRange: [30, 200],
    defaultPower: 80,
    heightRange: [4, 12],
    defaultHeight: 7,
    radiusRange: [10, 32],
    defaultRadius: 20,
    beamRange: [20, 90],
    defaultBeam: 45,
    sourceSize: 0.18,
    efficacy: 95,
    wallMount: false,
    color: '#fff2cc',
  },
  foot: {
    type: 'foot',
    name: '地脚灯',
    icon: '💡',
    powerRange: [3, 18],
    defaultPower: 7,
    heightRange: [0.2, 0.9],
    defaultHeight: 0.4,
    radiusRange: [1.5, 6],
    defaultRadius: 3.5,
    beamRange: [30, 100],
    defaultBeam: 70,
    sourceSize: 0.08,
    efficacy: 70,
    wallMount: false,
    color: '#ffe9c7',
  },
  solar: {
    type: 'solar',
    name: '太阳能壁灯',
    icon: '🔆',
    powerRange: [5, 40],
    defaultPower: 15,
    heightRange: [1.8, 4.0],
    defaultHeight: 2.6,
    radiusRange: [3, 12],
    defaultRadius: 6,
    beamRange: [50, 120],
    defaultBeam: 90,
    sourceSize: 0.15,
    efficacy: 100,
    wallMount: true, // 只能贴围栏/建筑外墙
    color: '#fff6da',
  },
}

export const CCT_MIN = 2700
export const CCT_MAX = 6500

// ---- 场地元素 ----
// kind: tent(帐篷区) campfire(篝火场) trail(步道) court(篮球场) water(水房)
// occluder 字段表示该元素是否挡光以及挡光方式
export const ZONES = [
  {
    id: 'tent-a', name: '帐篷区A', kind: 'tent',
    rect: { x: 70, y: 80, w: 250, h: 170 },
    pads: [ // 营位边线(帐篷位), 灯可吸附
      { x: 90, y: 100, w: 60, h: 46 },
      { x: 165, y: 100, w: 60, h: 46 },
      { x: 240, y: 100, w: 60, h: 46 },
      { x: 90, y: 178, w: 60, h: 46 },
      { x: 165, y: 178, w: 60, h: 46 },
      { x: 240, y: 178, w: 60, h: 46 },
    ],
    targetLux: 30,
  },
  {
    id: 'tent-b', name: '帐篷区B', kind: 'tent',
    rect: { x: 70, y: 300, w: 250, h: 150 },
    pads: [
      { x: 90, y: 320, w: 60, h: 46 },
      { x: 165, y: 320, w: 60, h: 46 },
      { x: 240, y: 320, w: 60, h: 46 },
      { x: 90, y: 392, w: 60, h: 46 },
      { x: 165, y: 392, w: 60, h: 46 },
      { x: 240, y: 392, w: 60, h: 46 },
    ],
    targetLux: 30,
  },
  {
    id: 'campfire', name: '篝火场', kind: 'campfire',
    rect: { x: 430, y: 120, w: 180, h: 160 },
    targetLux: 50,
  },
  {
    id: 'court', name: '篮球场', kind: 'court',
    rect: { x: 700, y: 90, w: 240, h: 190 },
    targetLux: 75,
  },
  {
    id: 'water', name: '水房', kind: 'water',
    rect: { x: 760, y: 360, w: 130, h: 110 },
    targetLux: 40,
  },
  // 步道(折线区域, 用一系列线段表示)
  {
    id: 'trail-main', name: '主步道', kind: 'trail',
    path: [
      { x: 320, y: 165 }, { x: 430, y: 165 },
      { x: 430, y: 280 }, { x: 700, y: 280 },
      { x: 700, y: 415 }, { x: 760, y: 415 },
    ],
    width: 18,
    targetLux: 20,
  },
  {
    id: 'trail-b', name: '营区步道', kind: 'trail',
    path: [
      { x: 320, y: 375 }, { x: 430, y: 375 }, { x: 430, y: 280 },
    ],
    width: 14,
    targetLux: 20,
  },
]

// ---- 挡光物 ----
// 树冠(圆形软阴影), 帐篷顶(矩形, 跟随帐篷位), 围栏(线段)
export const TREES = [
  { id: 't1', x: 380, y: 60, r: 34 },
  { id: 't2', x: 640, y: 110, r: 30 },
  { id: 't3', x: 660, y: 360, r: 36 },
  { id: 't4', x: 400, y: 500, r: 32 },
  { id: 't5', x: 120, y: 560, r: 28 },
  { id: 't6', x: 900, y: 560, r: 30 },
  { id: 't7', x: 560, y: 560, r: 26 },
]

export const FENCES = [
  // 营地外围围栏(留出入口)
  { x1: 40, y1: 40, x2: 960, y2: 40 },
  { x1: 960, y1: 40, x2: 960, y2: 620 },
  { x1: 960, y1: 620, x2: 600, y2: 620 },
  { x1: 470, y1: 620, x2: 40, y2: 620 },
  { x1: 40, y1: 620, x2: 40, y2: 40 },
]

// ---- 时间轴 ----
// t: 0=傍晚(18:00) 1=熄灯(23:00)
export const TIME_LABELS = [
  { t: 0.0, label: '18:00 傍晚' },
  { t: 0.25, label: '19:15 黄昏' },
  { t: 0.5, label: '20:30 入夜' },
  { t: 0.75, label: '21:45 深夜' },
  { t: 1.0, label: '23:00 熄灯' },
]

// 太阳高度角(度, 负值表示地平线下), 从 8° 降到 -25°
export function sunAltitude(t) { return 8 - 33 * t }
export function sunAzimuth(t) { return 250 + 60 * t } // 度
// 环境光(lx), 傍晚 12 -> 熄灯 0.3
export function ambientLux(t) { return 12 * Math.pow(1 - t, 1.6) + 0.3 }
// 灯具开启比例: 傍晚部分开启, 20:30 全开, 熄灯全关
export function lampOnFraction(t) {
  if (t < 0.2) return 0.45 + (0.55 * t) / 0.2
  if (t < 0.95) return 1
  return Math.max(0, 1 - (t - 0.95) / 0.05)
}
// 天空背景亮度系数
export function skyDarkness(t) { return Math.min(1, 0.25 + t * 0.95) }

// ---- 照度色阶 ----
export const LUX_BANDS = [
  { min: 0, max: 5, color: '#0b1026' },
  { min: 5, max: 10, color: '#13204a' },
  { min: 10, max: 20, color: '#1d3a6e' },
  { min: 20, max: 40, color: '#2d6a8f' },
  { min: 40, max: 75, color: '#3f9a8a' },
  { min: 75, max: 120, color: '#86b85a' },
  { min: 120, max: 200, color: '#e3c44d' },
  { min: 200, max: Infinity, color: '#f4a340' },
]
export const DARK_THRESHOLD = 20 // lx

export function luxColor(lux) {
  for (const b of LUX_BANDS) if (lux >= b.min && lux < b.max) return b.color
  return LUX_BANDS[LUX_BANDS.length - 1].color
}
