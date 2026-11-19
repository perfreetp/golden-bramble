// 全局状态：工单流转 + 工作台轮廓（localStorage 持久化）
import { createStore } from 'solid-js/store';
import type { ProfileDraft, ProfilePoint, Role, WorkOrder } from './types';
import { presetLongNeck500, presetRoundShoulder250, uid } from './lib/geometry';

const STORAGE_KEY = 'bottle-label-studio-v1';

export type ViewKey = 'intake' | 'workbench' | 'qc' | 'dashboard';

interface WorkbenchState {
  orderId: string | null;
  points: ProfilePoint[];
  selectedId: string | null;
  labelZMin: number;
  labelZMax: number;
  safeOffset: number;
  bleedOffset: number;
  curvatureLimit: number;
  seamPhiDeg: number;
}

interface AppState {
  role: Role;
  view: ViewKey;
  orders: WorkOrder[];
  counter: number;
  workbench: WorkbenchState;
}

function defaultDraft(): ProfileDraft {
  return {
    points: presetRoundShoulder250(),
    label: { zMin: 28, zMax: 100 },
    offsets: { safe: 3, bleed: 2 },
    curvatureLimit: 0.2,
  };
}

function initialWorkbench(): WorkbenchState {
  const d = defaultDraft();
  return {
    orderId: null,
    points: d.points,
    selectedId: d.points[3]?.id ?? null,
    labelZMin: d.label.zMin,
    labelZMax: d.label.zMax,
    safeOffset: d.offsets.safe,
    bleedOffset: d.offsets.bleed,
    curvatureLimit: d.curvatureLimit,
    seamPhiDeg: 0,
  };
}

function seedOrders(): WorkOrder[] {
  const now = Date.now();
  const mk = (partial: Partial<WorkOrder> & Pick<WorkOrder, 'code' | 'title' | 'capacity' | 'material' | 'status'>): WorkOrder => ({
    id: uid('wo'),
    customer: '蓝月亮日化',
    assignee: null,
    createdAt: now - 86400000,
    reworkCount: 0,
    history: [{ t: now - 86400000, action: '前台接单', by: '前台·王敏' }],
    draft: null,
    metrics: null,
    lastRejectReason: null,
    qcChecks: null,
    ...partial,
  });

  const d1 = defaultDraft();
  return [
    mk({
      code: 'WO-20261119-001',
      title: '250ml 沐浴露圆肩瓶',
      capacity: 250,
      material: 'HDPE',
      customer: '蓝月亮日化',
      status: 'assigned',
      assignee: '设计师·李工',
      history: [
        { t: now - 86400000, action: '前台接单', by: '前台·王敏' },
        { t: now - 43200000, action: '分派给 设计师·李工', by: '前台·王敏' },
      ],
    }),
    mk({
      code: 'WO-20261119-002',
      title: '500ml 洗发水瓶标签复核',
      capacity: 500,
      material: 'PET',
      customer: '清扬包装部',
      status: 'submitted',
      assignee: '设计师·陈工',
      draft: d1,
      metrics: { volumeMl: 249.3, labelWidthMm: 150.8, labelHeightMm: 72, maxElongationPct: 0.0 },
      history: [
        { t: now - 86400000, action: '前台接单', by: '前台·王敏' },
        { t: now - 36000000, action: '分派给 设计师·陈工', by: '前台·王敏' },
        { t: now - 7200000, action: '提交质检', by: '设计师·陈工' },
      ],
    }),
    mk({
      code: 'WO-20261118-003',
      title: '150ml 洁面乳挤压瓶',
      capacity: 150,
      material: 'LDPE',
      customer: '屈臣氏自有品牌',
      status: 'rework',
      assignee: '设计师·李工',
      reworkCount: 1,
      lastRejectReason: '肩部曲率超阈值，标签伸长率峰值 6.8% 超过 5% 内控要求',
      history: [
        { t: now - 2 * 86400000, action: '前台接单', by: '前台·王敏' },
        { t: now - 2 * 86400000 + 3600000, action: '分派给 设计师·李工', by: '前台·王敏' },
        { t: now - 86400000, action: '提交质检', by: '设计师·李工' },
        { t: now - 50000000, action: '质检打回：伸长率超标', by: '质检·赵品' },
      ],
    }),
    mk({
      code: 'WO-20261117-004',
      title: '750ml 洗衣液补充装瓶',
      capacity: 750,
      material: 'PCR-PE',
      customer: '立白包装',
      status: 'passed',
      assignee: '设计师·陈工',
      history: [
        { t: now - 3 * 86400000, action: '前台接单', by: '前台·王敏' },
        { t: now - 3 * 86400000 + 3600000, action: '分派给 设计师·陈工', by: '前台·王敏' },
        { t: now - 2 * 86400000, action: '提交质检', by: '设计师·陈工' },
        { t: now - 2 * 86400000 + 7200000, action: '质检通过', by: '质检·赵品' },
      ],
    }),
  ];
}

function load(): AppState {
  const base: AppState = {
    role: 'designer',
    view: 'workbench',
    orders: seedOrders(),
    counter: 5,
    workbench: initialWorkbench(),
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      return {
        ...base,
        role: parsed.role ?? base.role,
        view: parsed.view ?? base.view,
        orders: parsed.orders?.length ? parsed.orders : base.orders,
        counter: parsed.counter ?? base.counter,
        workbench: { ...base.workbench, ...(parsed.workbench ?? {}) },
      };
    }
  } catch {
    // 持久化损坏时回退种子数据
  }
  return base;
}

const [state, setState] = createStore<AppState>(load());

// 自动持久化（工作台与工单变更都会触发）
function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        role: state.role,
        view: state.view,
        orders: state.orders,
        counter: state.counter,
        workbench: state.workbench,
      }),
    );
  } catch {
    // 存储不可用时静默降级为内存态
  }
}

export const store = state;

function logOrder(orderId: string, action: string, by: string) {
  const idx = state.orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return;
  setState('orders', idx, 'history', (h) => [...h, { t: Date.now(), action, by }]);
}

const roleName = (role: Role): string => {
  switch (role) {
    case 'frontdesk':
      return '前台·王敏';
    case 'designer':
      return '设计师·李工';
    case 'qc':
      return '质检·赵品';
    case 'manager':
      return '主管';
  }
};

export const actions = {
  setRole(role: Role) {
    setState('role', role);
    persist();
  },
  setView(view: ViewKey) {
    setState('view', view);
    persist();
  },

  // ---- 工单流转 ----
  createOrder(input: { title: string; capacity: number; material: string; customer: string }): string {
    const n = state.counter;
    const code = `WO-20261119-${String(n).padStart(3, '0')}`;
    const id = uid('wo');
    const order: WorkOrder = {
      id,
      code,
      title: input.title,
      capacity: input.capacity,
      material: input.material,
      customer: input.customer,
      status: 'received',
      assignee: null,
      createdAt: Date.now(),
      reworkCount: 0,
      history: [{ t: Date.now(), action: '前台接单', by: roleName('frontdesk') }],
      draft: null,
      metrics: null,
      lastRejectReason: null,
      qcChecks: null,
    };
    setState('orders', (os) => [order, ...os]);
    setState('counter', n + 1);
    persist();
    return id;
  },

  assignOrder(orderId: string, assignee: string) {
    const idx = state.orders.findIndex((o) => o.id === orderId);
    if (idx < 0) return;
    setState('orders', idx, { status: 'assigned', assignee });
    logOrder(orderId, `分派给 ${assignee}`, roleName(state.role));
    persist();
  },

  openInWorkbench(orderId: string) {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;
    const draft = order.draft ?? defaultDraft();
    setState('workbench', {
      orderId,
      points: draft.points.map((p) => ({ ...p })),
      selectedId: draft.points[Math.min(3, draft.points.length - 1)]?.id ?? null,
      labelZMin: draft.label.zMin,
      labelZMax: draft.label.zMax,
      safeOffset: draft.offsets.safe,
      bleedOffset: draft.offsets.bleed,
      curvatureLimit: draft.curvatureLimit,
      seamPhiDeg: 0,
    });
    setState('view', 'workbench');
    persist();
  },

  submitOrder(orderId: string, metrics: WorkOrder['metrics']) {
    const idx = state.orders.findIndex((o) => o.id === orderId);
    if (idx < 0) return;
    const wb = state.workbench;
    const draft: ProfileDraft = {
      points: wb.points.map((p) => ({ ...p })),
      label: { zMin: wb.labelZMin, zMax: wb.labelZMax },
      offsets: { safe: wb.safeOffset, bleed: wb.bleedOffset },
      curvatureLimit: wb.curvatureLimit,
    };
    setState('orders', idx, {
      status: 'submitted',
      draft,
      metrics,
      lastRejectReason: null,
      qcChecks: null,
    });
    logOrder(orderId, '提交质检', state.orders[idx].assignee ?? roleName('designer'));
    persist();
  },

  qcPass(orderId: string, checks: NonNullable<WorkOrder['qcChecks']>) {
    const idx = state.orders.findIndex((o) => o.id === orderId);
    if (idx < 0) return;
    setState('orders', idx, { status: 'passed', qcChecks: checks, lastRejectReason: null });
    logOrder(orderId, '质检通过', roleName('qc'));
    persist();
  },

  qcReject(orderId: string, reason: string, checks: NonNullable<WorkOrder['qcChecks']>) {
    const idx = state.orders.findIndex((o) => o.id === orderId);
    if (idx < 0) return;
    const prev = state.orders[idx];
    setState('orders', idx, {
      status: 'rework',
      reworkCount: prev.reworkCount + 1,
      lastRejectReason: reason,
      qcChecks: checks,
    });
    logOrder(orderId, `质检打回：${reason}`, roleName('qc'));
    persist();
  },

  // ---- 工作台轮廓编辑 ----
  updatePoint(id: string, patch: Partial<ProfilePoint>) {
    const idx = state.workbench.points.findIndex((p) => p.id === id);
    if (idx < 0) return;
    setState('workbench', 'points', idx, (p) => ({
      ...p,
      r: Math.max(0, patch.r ?? p.r),
      z: Math.max(0, patch.z ?? p.z),
    }));
    persist();
  },
  addPoint(r: number, z: number) {
    const p: ProfilePoint = { id: uid(), r: Math.max(0, r), z: Math.max(0, z) };
    setState('workbench', 'points', (ps) => [...ps, p].sort((a, b) => a.z - b.z));
    setState('workbench', 'selectedId', p.id);
    persist();
  },
  removePoint(id: string) {
    if (state.workbench.points.length <= 2) return;
    setState('workbench', 'points', (ps) => ps.filter((p) => p.id !== id));
    if (state.workbench.selectedId === id) setState('workbench', 'selectedId', null);
    persist();
  },
  selectPoint(id: string | null) {
    setState('workbench', 'selectedId', id);
  },
  setWorkbench(patch: Partial<Omit<WorkbenchState, 'points' | 'orderId'>>) {
    setState('workbench', patch);
    persist();
  },
  loadPreset(kind: 'round250' | 'long500') {
    const points = kind === 'round250' ? presetRoundShoulder250() : presetLongNeck500();
    setState('workbench', 'points', points);
    setState('workbench', 'selectedId', points[3]?.id ?? null);
    persist();
  },
  resetWorkbench() {
    setState('workbench', initialWorkbench());
    persist();
  },
};

