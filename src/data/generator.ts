import type { Feature, FeatureGeom, GridCell, LayerId, PointKind, LineKind, AreaKind, Student } from '../types';

// ---------- 场地常量(单位:米) ----------
export const FIELD = {
  minX: -150,
  maxX: 150,
  minZ: -110,
  maxZ: 110,
  width: 300,
  depth: 220,
};

export const CELL_SIZE = 20; // 空间网格边长 20m

export interface Zone {
  name: string;
  x0: number;
  z0: number;
  x1: number;
  z1: number;
}

/** 科目训练分区 */
export const ZONES: Zone[] = [
  { name: '倒车入库区', x0: -140, z0: -95, x1: -20, z1: -25 },
  { name: '侧方停车区', x0: -10, z0: -95, x1: 140, z1: -25 },
  { name: '曲线行驶区', x0: -140, z0: -15, x1: -30, z1: 45 },
  { name: '直角转弯区', x0: -20, z0: -15, x1: 60, z1: 45 },
  { name: '坡道定点区', x0: 70, z0: -15, x1: 140, z1: 45 },
  { name: '综合训练道', x0: -140, z0: 55, x1: 140, z1: 100 },
];

// ---------- 确定性随机数(种子固定,每次刷新数据一致) ----------
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261119);
const rf = (a: number, b: number) => a + rand() * (b - a);
const ri = (a: number, b: number) => Math.floor(rf(a, b + 1));
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

// ---------- 要素累积 ----------
const features: Feature[] = [];
const grid = new Map<string, GridCell>();
const counters: Record<LayerId, number> = { base: 0, lane: 0, pile: 0, sign: 0, device: 0 };
const PREFIX: Record<LayerId, string> = { base: 'BASE', lane: 'LANE', pile: 'PILE', sign: 'SIGN', device: 'DEV' };

function cellKey(cx: number, cz: number) {
  return `${cx}_${cz}`;
}

function registerCells(f: Feature) {
  let minX: number, maxX: number, minZ: number, maxZ: number;
  if (f.geom.type === 'point') {
    minX = maxX = f.geom.x;
    minZ = maxZ = f.geom.z;
  } else {
    const xs = f.geom.points.map((p) => p[0]);
    const zs = f.geom.points.map((p) => p[1]);
    minX = Math.min(...xs);
    maxX = Math.max(...xs);
    minZ = Math.min(...zs);
    maxZ = Math.max(...zs);
  }
  const c0x = Math.floor(minX / CELL_SIZE);
  const c1x = Math.floor(maxX / CELL_SIZE);
  const c0z = Math.floor(minZ / CELL_SIZE);
  const c1z = Math.floor(maxZ / CELL_SIZE);
  for (let cx = c0x; cx <= c1x; cx++) {
    for (let cz = c0z; cz <= c1z; cz++) {
      const k = cellKey(cx, cz);
      let cell = grid.get(k);
      if (!cell) {
        cell = { cx, cz, featureIds: [] };
        grid.set(k, cell);
      }
      cell.featureIds.push(f.id);
    }
  }
}

function add(
  layer: LayerId,
  kind: PointKind | LineKind | AreaKind,
  name: string,
  geom: FeatureGeom,
  label = '',
  attrs: Record<string, string> = {},
): Feature {
  const seq = ++counters[layer];
  const id = `${PREFIX[layer]}-${String(seq).padStart(5, '0')}`;
  const f: Feature = {
    id,
    layer,
    kind,
    name,
    geom,
    label,
    visible: null,
    attrs: { 编号: id, 状态: '在用', ...attrs },
  };
  features.push(f);
  registerCells(f);
  return f;
}

const clampX = (x: number) => Math.max(FIELD.minX + 2, Math.min(FIELD.maxX - 2, x));
const clampZ = (z: number) => Math.max(FIELD.minZ + 2, Math.min(FIELD.maxZ - 2, z));

function inZone(z: Zone) {
  return { x: rf(z.x0, z.x1), z: rf(z.z0, z.z1) };
}

// ========== 1. 底图层:硬化地面、建筑、绿化、围墙、库位地坪 ==========
function genBase() {
  // 整片训练场地坪:按空间网格切块,保证 LOD0 轮廓块与视口剔除完整覆盖
  for (let x = FIELD.minX; x < FIELD.maxX; x += CELL_SIZE) {
    for (let z = FIELD.minZ; z < FIELD.maxZ; z += CELL_SIZE) {
      const x1 = Math.min(x + CELL_SIZE, FIELD.maxX);
      const z1 = Math.min(z + CELL_SIZE, FIELD.maxZ);
      add('base', 'pavement', '训练场地坪', {
        type: 'area',
        kind: 'pavement',
        points: [
          [x, z],
          [x1, z],
          [x1, z1],
          [x, z1],
        ],
      });
    }
  }
  // 围墙(分段)
  const seg = 20;
  for (let x = FIELD.minX; x < FIELD.maxX; x += seg) {
    const w = Math.min(seg, FIELD.maxX - x);
    add('base', 'wall', '围墙', {
      type: 'area',
      kind: 'wall',
      points: [
        [x, FIELD.minZ],
        [x + w, FIELD.minZ],
        [x + w, FIELD.minZ + 1.2],
        [x, FIELD.minZ + 1.2],
      ],
    });
    add('base', 'wall', '围墙', {
      type: 'area',
      kind: 'wall',
      points: [
        [x, FIELD.maxZ - 1.2],
        [x + w, FIELD.maxZ - 1.2],
        [x + w, FIELD.maxZ],
        [x, FIELD.maxZ],
      ],
    });
  }
  // 建筑:综合楼、车库、设备房
  const buildings: [string, number, number, number, number][] = [
    ['综合教学楼', -130, 88, 36, 18],
    ['室内训练馆', -70, 88, 30, 16],
    ['维修车库', 20, 88, 28, 14],
    ['配电设备房', 118, 90, 18, 12],
  ];
  for (const [name, x, z, w, d] of buildings) {
    add('base', 'building', name, {
      type: 'area',
      kind: 'building',
      points: [
        [x, z],
        [x + w, z],
        [x + w, z + d],
        [x, z + d],
      ],
    }, name);
  }
  // 绿化带块
  for (let i = 0; i < 90; i++) {
    const w = rf(3, 10);
    const d = rf(2, 6);
    const p = inZone(pick(ZONES));
    add('base', 'green', '绿化带', {
      type: 'area',
      kind: 'green',
      points: [
        [p.x, p.z],
        [p.x + w, p.z],
        [p.x + w, p.z + d],
        [p.x, p.z + d],
      ],
    });
  }
  // 库位地坪(每个库位一块矩形地坪)
  for (const zone of [ZONES[0], ZONES[1]]) {
    for (let bx = zone.x0 + 6; bx < zone.x1 - 10; bx += 9) {
      for (let bz = zone.z0 + 6; bz < zone.z1 - 10; bz += 8) {
        add('base', 'bay', '库位地坪', {
          type: 'area',
          kind: 'bay',
          points: [
            [bx, bz],
            [bx + 2.5, bz],
            [bx + 2.5, bz + 5],
            [bx, bz + 5],
          ],
        });
      }
    }
  }
  // 散点硬化补丁
  for (let i = 0; i < 120; i++) {
    const p = inZone(pick(ZONES));
    const w = rf(4, 12);
    const d = rf(4, 10);
    add('base', 'pavement', '硬化地面', {
      type: 'area',
      kind: 'pavement',
      points: [
        [p.x, p.z],
        [p.x + w, p.z],
        [p.x + w, p.z + d],
        [p.x, p.z + d],
      ],
    });
  }
}

// ========== 2. 车道层:库位线、虚线、边缘线、停止线、导向 ==========
function line(x1: number, z1: number, x2: number, z2: number, kind: LineKind, name: string, attrs = {}) {
  add('lane', kind, name, { type: 'line', points: [[clampX(x1), clampZ(z1)], [clampX(x2), clampZ(z2)]] }, '', attrs);
}

function genLane() {
  // 2.1 倒车入库 / 侧方停车库位线
  for (const zone of [ZONES[0], ZONES[1]]) {
    for (let bx = zone.x0 + 6; bx < zone.x1 - 10; bx += 9) {
      for (let bz = zone.z0 + 6; bz < zone.z1 - 10; bz += 8) {
        // 库位三边实线 + 前边虚线
        line(bx, bz, bx, bz + 5, 'solid', '库位边线', { 所属科目: zone.name });
        line(bx + 2.5, bz, bx + 2.5, bz + 5, 'solid', '库位中线', { 所属科目: zone.name });
        line(bx, bz, bx + 2.5, bz, 'solid', '库位底线', { 所属科目: zone.name });
        line(bx, bz + 5, bx + 1.0, bz + 5, 'dashed', '库位口虚线', { 所属科目: zone.name });
        line(bx + 1.5, bz + 5, bx + 2.5, bz + 5, 'dashed', '库位口虚线', { 所属科目: zone.name });
      }
    }
  }
  // 2.2 曲线行驶:正弦曲线采样为短边段
  for (let t = 0; t < 12; t++) {
    const zone = ZONES[2];
    const baseX = zone.x0 + 4 + (t % 4) * 26;
    const baseZ = zone.z0 + 6 + Math.floor(t / 4) * 18;
    const len = 22;
    let prev: [number, number] | null = null;
    for (let s = 0; s <= 48; s++) {
      const px = baseX + (s / 48) * len;
      const pz = baseZ + Math.sin((s / 48) * Math.PI * 2) * 3.2;
      if (prev) line(prev[0], prev[1], px, pz, 'solid', '曲线路缘线', { 所属科目: '曲线行驶区' });
      prev = [px, pz];
    }
  }
  // 2.3 直角转弯:L 形通道线
  for (let t = 0; t < 18; t++) {
    const zone = ZONES[3];
    const bx = zone.x0 + 4 + (t % 5) * 15;
    const bz = zone.z0 + 5 + Math.floor(t / 5) * 14;
    line(bx, bz, bx + 9, bz, 'edge', '直角转弯边线');
    line(bx + 9, bz, bx + 9, bz + 8, 'edge', '直角转弯边线');
    line(bx, bz + 3.5, bx + 9, bz + 3.5, 'dashed', '通道引导虚线');
  }
  // 2.4 综合训练道:长车道虚线(每段虚线为独立要素)+ 边缘线
  const zone6 = ZONES[5];
  for (let lz = zone6.z0 + 8; lz < zone6.z1 - 4; lz += 9) {
    line(zone6.x0 + 4, lz, zone6.x1 - 4, lz, 'edge', '车道边缘线');
    for (let dx = zone6.x0 + 6; dx < zone6.x1 - 8; dx += 4) {
      line(dx, lz + 3.2, dx + 2, lz + 3.2, 'dashed', '车道中心虚线');
    }
  }
  // 2.5 坡道定点:停止线 + 坡道两侧线
  const zone5 = ZONES[4];
  for (let bx = zone5.x0 + 6; bx < zone5.x1 - 8; bx += 12) {
    for (let bz = zone5.z0 + 6; bz < zone5.z1 - 8; bz += 14) {
      line(bx, bz, bx + 8, bz, 'stop', '定点停止线');
      line(bx, bz - 4, bx, bz + 6, 'edge', '坡道边线');
      line(bx + 8, bz - 4, bx + 8, bz + 6, 'edge', '坡道边线');
    }
  }
  // 2.6 斑马线(多条平行短实线)
  for (let t = 0; t < 44; t++) {
    const p = inZone(pick([ZONES[5], ZONES[3], ZONES[4]]));
    for (let s = 0; s < 8; s++) {
      line(p.x + s * 0.6, p.z, p.x + s * 0.6, p.z + 4, 'solid', '斑马线条纹');
    }
  }
  // 2.7 导向箭头(用折线近似的箭头线)
  const arrowNames = ['直行箭头', '左转箭头', '右转箭头', '掉头箭头'];
  for (let t = 0; t < 420; t++) {
    const p = inZone(pick(ZONES));
    const name = pick(arrowNames);
    add(
      'lane',
      'guide',
      name,
      {
        type: 'line',
        points: [
          [p.x, p.z - 1.6],
          [p.x, p.z + 1.6],
          [p.x - 0.9, p.z + 0.7],
          [p.x, p.z + 1.6],
          [p.x + 0.9, p.z + 0.7],
        ],
      },
      '',
      { 所属科目: pick(ZONES).name },
    );
  }
  // 2.8 库位编号地面字(以短刻线模拟,归入车道要素)
  for (let t = 0; t < 1500; t++) {
    const p = inZone(pick([ZONES[0], ZONES[1]]));
    line(p.x, p.z, p.x + 0.8, p.z, 'solid', '地面编号刻线');
  }
  // 2.9 减速提示钉点连线与车道分界短线
  for (let t = 0; t < 900; t++) {
    const p = inZone(pick([ZONES[5], ZONES[3], ZONES[4]]));
    line(p.x, p.z, p.x + rf(0.5, 1.4), p.z + rf(-0.3, 0.3), 'dashed', '车道分界短线');
  }
}

// ========== 3. 桩位层 ==========
function genPiles() {
  const specs = ['Φ75mm 钢管桩', 'Φ110mm 感应桩', '橡胶限位桩'];
  const zonesA = [ZONES[0], ZONES[1], ZONES[3], ZONES[4]];
  // 训练标杆:库位角点附近大量布设
  for (let i = 0; i < 2000; i++) {
    const z = pick(zonesA);
    const p = inZone(z);
    add(
      'pile',
      'pole',
      '训练标杆',
      { type: 'point', x: clampX(p.x), z: clampZ(p.z), rot: rf(0, 360), size: rf(0.8, 1.2) },
      '',
      { 规格: specs[0], 所属科目: z.name },
    );
  }
  for (let i = 0; i < 900; i++) {
    const z = pick(ZONES);
    const p = inZone(z);
    const f = add(
      'pile',
      'sensor',
      '感应桩',
      { type: 'point', x: clampX(p.x), z: clampZ(p.z), rot: rf(0, 360), size: 1.1 },
      '',
      { 规格: specs[1], 所属科目: z.name },
    );
    // 仅抽样约 1/8 的桩位带文字标注,避免图面编号刷屏(全部编号仍可搜索)
    if (i % 8 === 0) f.label = f.id;
  }
  for (let i = 0; i < 500; i++) {
    const z = pick(zonesA);
    const p = inZone(z);
    const f = add(
      'pile',
      'limit',
      '限位桩',
      { type: 'point', x: clampX(p.x), z: clampZ(p.z), rot: 0, size: 1 },
      '',
      { 规格: specs[2], 所属科目: z.name },
    );
    if (i % 10 === 0) f.label = f.id;
  }
}

// ========== 4. 标志层 ==========
function genSigns() {
  const warnNames = ['限速标志', '限宽标志', '注意行人', '弯道警告', '坡道警告', '学校区域'];
  const orderNames = ['停车让行', '减速让行', '禁止鸣笛', '直行指令', '掉头指令'];
  for (let i = 0; i < 550; i++) {
    const p = inZone(pick(ZONES));
    const name = pick(warnNames);
    const f = add(
      'sign',
      'signWarn',
      name,
      { type: 'point', x: clampX(p.x), z: clampZ(p.z), rot: rf(0, 360), size: 1.2 },
      name,
      { 板面规格: '△900mm' },
    );
    f.label = name;
  }
  for (let i = 0; i < 550; i++) {
    const p = inZone(pick(ZONES));
    const name = pick(orderNames);
    add(
      'sign',
      'signOrder',
      name,
      { type: 'point', x: clampX(p.x), z: clampZ(p.z), rot: rf(0, 360), size: 1.1 },
      name,
      { 板面规格: 'Φ800mm' },
    );
  }
  for (let i = 0; i < 300; i++) {
    const z = pick(ZONES);
    const p = inZone(z);
    const name = `${z.name}告示牌`;
    add(
      'sign',
      'signBoard',
      name,
      { type: 'point', x: clampX(p.x), z: clampZ(p.z), rot: rf(0, 360), size: 1.6 },
      name,
      { 板面规格: '1200×800mm', 所属科目: z.name },
    );
  }
}

// ========== 5. 设备层:照明杆、监控点、信号设备 ==========
function genDevices() {
  // 照明杆:沿场地两侧规律布置
  let n = 0;
  for (let x = FIELD.minX + 15; x < FIELD.maxX - 10; x += 24) {
    for (const z of [FIELD.minZ + 8, FIELD.maxZ - 8]) {
      const f = add(
        'device',
        'lamp',
        '照明杆',
        { type: 'point', x, z, size: 1.8 },
        '',
        { 规格: '12m 双臂路灯', 功率: '2×150W LED' },
      );
      if (n++ % 2 === 0) f.label = f.id;
    }
  }
  // 监控点:分区覆盖
  for (let i = 0; i < 160; i++) {
    const z = pick(ZONES);
    const p = inZone(z);
    const f = add(
      'device',
      'camera',
      '监控摄像头',
      { type: 'point', x: clampX(p.x), z: clampZ(p.z), rot: rf(0, 360), size: 1.4 },
      '',
      { 型号: '球型云台摄像机', 覆盖区域: z.name },
    );
    f.label = f.id;
  }
  for (let i = 0; i < 80; i++) {
    const p = inZone(pick(ZONES));
    add(
      'device',
      'signal',
      '信号设备',
      { type: 'point', x: clampX(p.x), z: clampZ(p.z), rot: rf(0, 360), size: 1.2 },
      '',
      { 型号: '地感信号机' },
    );
  }
}

export interface GeneratedData {
  features: Feature[];
  grid: Map<string, GridCell>;
  layerCounts: Record<LayerId, number>;
  students: Student[];
}

export function generateData(): GeneratedData {
  genBase();
  genLane();
  genPiles();
  genSigns();
  genDevices();
  const students: Student[] = [
    '张伟', '王芳', '李娜', '刘洋', '陈静', '杨磊', '赵敏', '黄强',
    '周婷', '吴昊', '徐丽', '孙鹏',
  ].map((name, i) => ({
    id: `STU-${String(i + 1).padStart(3, '0')}`,
    name,
    classNo: `C2-${2601 + (i % 3)}`,
  }));
  return { features, grid, layerCounts: { ...counters }, students };
}
