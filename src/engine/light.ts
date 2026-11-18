// 二维剖面光照引擎：多灯叠加 + 逆平方衰减 + 光锥裁剪 + 遮挡软阴影
import type { FieldResult, Lamp, Obstacle, PeriodId, Plan, ZoneStats } from '../types';
import { specOf, DARK_THRESHOLD } from '../constants';

const CELL_CM = 2;
const TUBE_SAMPLES = 7;   // 线性光源采样数
const DISC_SAMPLES = 6;   // 点光源虚拟面光源采样（模拟半影）
const DISC_RADIUS = 1.6;  // cm

/** 障碍物不透光度（树枝缝隙透光、水盆浅水透光） */
const OPACITY: Record<Obstacle['kind'], number> = {
  hide: 1,
  dish: 0.9,
  branch: 0.72
};

/** 确定性虚拟采样偏移（金角分布），避免逐帧抖动 */
const DISC_OFFSETS: Array<[number, number]> = Array.from({ length: DISC_SAMPLES }, (_, i) => {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const a = i * golden;
  const r = DISC_RADIUS * Math.sqrt((i + 0.5) / DISC_SAMPLES);
  return [Math.cos(a) * r, Math.sin(a) * r];
});

interface Segment {
  x1: number; y1: number; x2: number; y2: number;
}

/** 线段与轴对齐矩形相交检测（slab 法），相交返回透射率衰减系数 */
function rectAttenuation(seg: Segment, obs: Obstacle): number {
  const minX = obs.x - obs.w / 2;
  const maxX = obs.x + obs.w / 2;
  const minY = obs.y - obs.h / 2;
  const maxY = obs.y + obs.h / 2;
  const dx = seg.x2 - seg.x1;
  const dy = seg.y2 - seg.y1;
  let t0 = 1e-4;
  let t1 = 1 - 1e-4;
  const axes: Array<[number, number, number, number]> = [
    [dx, seg.x1, minX, maxX],
    [dy, seg.y1, minY, maxY]
  ];
  for (const [d, p, lo, hi] of axes) {
    if (Math.abs(d) < 1e-9) {
      if (p < lo || p > hi) return 1; // 平行且在矩形外
    } else {
      let ta = (lo - p) / d;
      let tb = (hi - p) / d;
      if (ta > tb) [ta, tb] = [tb, ta];
      t0 = Math.max(t0, ta);
      t1 = Math.min(t1, tb);
      if (t0 > t1) return 1;
    }
  }
  return 1 - OPACITY[obs.kind];
}

interface SourceSample {
  x: number;
  y: number;
  weight: number; // 占整灯通量比例
}

function lampSamples(lamp: Lamp): SourceSample[] {
  const spec = specOf(lamp.kind);
  const theta = (lamp.angle * Math.PI) / 180;
  const axisX = Math.cos(theta);
  const axisY = Math.sin(theta);
  const tubeX = -axisY; // 灯管方向垂直于光轴
  const tubeY = axisX;

  if (spec.length > 0) {
    // 线性光源：沿灯管方向均匀取点
    return Array.from({ length: TUBE_SAMPLES }, (_, i) => {
      const t = (i / (TUBE_SAMPLES - 1) - 0.5) * spec.length;
      return { x: lamp.x + tubeX * t, y: lamp.y + tubeY * t, weight: 1 / TUBE_SAMPLES };
    });
  }
  // 点光源：小圆盘虚拟采样，制造软阴影半影
  return DISC_OFFSETS.map(([ox, oy]) => ({
    x: lamp.x + ox,
    y: lamp.y + oy,
    weight: 1 / DISC_SAMPLES
  }));
}

/** 单灯在点 (px,py) 的直射照度（无遮挡） */
function directLampLux(lamp: Lamp, px: number, py: number): number {
  const spec = specOf(lamp.kind);
  const theta = (lamp.angle * Math.PI) / 180;
  const ax = Math.cos(theta);
  const ay = Math.sin(theta);
  let sum = 0;
  for (const s of lampSamples(lamp)) {
    const vx = px - s.x;
    const vy = py - s.y;
    const d2 = vx * vx + vy * vy;
    const d = Math.sqrt(d2);
    if (d < 1) continue;
    const cosGamma = (vx * ax + vy * ay) / d;
    const gamma = Math.acos(Math.min(1, Math.max(-1, cosGamma)));
    const half = (spec.halfAngleDeg * Math.PI) / 180;
    if (gamma > half) continue;
    // 光锥内余弦平方廓线，边缘自然衰减到 0
    const profile = Math.cos((gamma / half) * Math.PI * 0.5) ** 2;
    const falloff = (spec.refDistance * spec.refDistance) / d2;
    sum += s.weight * spec.refLux * falloff * profile * lamp.power;
  }
  return sum;
}

/** 单灯在点 (px,py) 的实际照度（计入遮挡软阴影） */
function shadedLampLux(lamp: Lamp, obstacles: Obstacle[], px: number, py: number): number {
  const spec = specOf(lamp.kind);
  const theta = (lamp.angle * Math.PI) / 180;
  const ax = Math.cos(theta);
  const ay = Math.sin(theta);
  let sum = 0;
  for (const s of lampSamples(lamp)) {
    const vx = px - s.x;
    const vy = py - s.y;
    const d2 = vx * vx + vy * vy;
    const d = Math.sqrt(d2);
    if (d < 1) continue;
    const cosGamma = (vx * ax + vy * ay) / d;
    const gamma = Math.acos(Math.min(1, Math.max(-1, cosGamma)));
    const half = (spec.halfAngleDeg * Math.PI) / 180;
    if (gamma > half) continue;
    const profile = Math.cos((gamma / half) * Math.PI * 0.5) ** 2;
    const falloff = (spec.refDistance * spec.refDistance) / d2;
    let transmittance = 1;
    const seg: Segment = { x1: s.x, y1: s.y, x2: px, y2: py };
    for (const o of obstacles) {
      const k = rectAttenuation(seg, o);
      transmittance *= k;
      if (transmittance < 0.02) {
        transmittance = 0;
        break;
      }
    }
    sum += s.weight * spec.refLux * falloff * profile * lamp.power * transmittance;
  }
  return sum;
}

export function activeLamps(plan: Plan, period: PeriodId): Lamp[] {
  return plan.lamps.filter(l => l.schedule[period]);
}

export function computeField(plan: Plan, lamps: Lamp[], ambient: number): FieldResult {
  const cols = Math.max(8, Math.round(plan.widthCm / CELL_CM));
  const rows = Math.max(6, Math.round(plan.heightCm / CELL_CM));
  const cellW = plan.widthCm / cols;
  const cellH = plan.heightCm / rows;
  const n = cols * rows;
  const lux = new Float32Array(n);
  const directLux = new Float32Array(n);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = (c + 0.5) * cellW;
      const py = (r + 0.5) * cellH;
      let v = ambient;
      let dv = ambient;
      for (const lamp of lamps) {
        v += shadedLampLux(lamp, plan.obstacles, px, py);
        dv += directLampLux(lamp, px, py);
      }
      lux[r * cols + c] = v;
      directLux[r * cols + c] = dv;
    }
  }

  let maxLux = 0;
  for (let i = 0; i < n; i++) maxLux = Math.max(maxLux, lux[i]);

  // 三个竖向分区：左 / 中 / 右
  const zoneCount = 3;
  const zones: ZoneStats[] = [];
  const floorBand = Math.max(1, Math.round(5 / cellH)); // 地面以上 5cm
  for (let z = 0; z < zoneCount; z++) {
    const c0 = Math.floor((z * cols) / zoneCount);
    const c1 = Math.floor(((z + 1) * cols) / zoneCount);
    let sum = 0;
    let floorSum = 0;
    let floorN = 0;
    let count = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = c0; c < c1; c++) {
        const val = lux[r * cols + c];
        sum += val;
        count++;
        if (r >= rows - floorBand) {
          floorSum += val;
          floorN++;
        }
      }
    }
    const avgLux = sum / count;
    zones.push({
      index: z,
      name: ['左区', '中区', '右区'][z],
      x0: c0 * cellW,
      x1: c1 * cellW,
      avgLux,
      floorLux: floorSum / Math.max(1, floorN),
      dark: avgLux < DARK_THRESHOLD,
      lampCount: lamps.filter(l => l.x >= c0 * cellW && l.x < c1 * cellW).length
    });
  }

  return { cols, rows, cellW, cellH, lux, directLux, maxLux, zones };
}
