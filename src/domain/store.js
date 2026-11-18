// 全局响应式状态与业务动作（SolidJS store + localStorage 持久化）
import { createStore, produce } from 'solid-js/store';
import { generateLayout } from './layout.js';
import { regenerate, resolveConflict } from './merge.js';
import { buildDashboard } from './bom.js';
import { seedFrom } from './rng.js';

const STORAGE_KEY = 'liuli-zhaobi-workbench-v1';
const MASTERS = ['王师傅', '李师傅', '赵师傅', '陈师傅'];

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.orders)) return data;
    }
  } catch (e) {
    console.warn('本地数据读取失败，按空库启动', e);
  }
  return { seq: 1, orders: [], currentOrderId: null, role: 'dispatcher' };
}

const [state, setState] = createStore(loadInitial());

// 持久化（Solid store 细粒度响应，整体序列化即可）
let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        seq: state.seq, orders: state.orders, currentOrderId: state.currentOrderId,
      }));
    } catch (e) {
      console.warn('持久化失败', e);
    }
  }, 120);
}

function currentOrder() {
  return state.orders.find((o) => o.id === state.currentOrderId) ?? null;
}

// —— 前台动作 ——
function createOrder(input) {
  const id = `ZB-${String(state.seq).padStart(4, '0')}`;
  const order = {
    id,
    width: Number(input.width),
    height: Number(input.height),
    colorGrade: Number(input.colorGrade),
    dueDate: input.dueDate,
    master: input.master || null,
    status: input.master ? 'assigned' : 'assigned',
    reworkCount: 0,
    qcHistory: [],
    createdAt: new Date().toISOString(),
    params: {
      orderId: id,
      width: Number(input.width),
      height: Number(input.height),
      bays: 3,
      baySpacing: Math.round((Number(input.width) - 300) / 3),
      eaveHeight: Math.round(Number(input.height) * 0.72),
      colorGrade: Number(input.colorGrade),
    },
    facade: null,
    zoneLocks: {},
    manualSeedCounter: 0,
  };
  setState(produce((s) => {
    s.orders.push(order);
    s.seq += 1;
    s.currentOrderId = id;
    s.role = 'master';
  }));
  persist();
  return id;
}

function assignMaster(orderId, master) {
  setState('orders', (o) => o.id === orderId, produce((o) => { o.master = master; }));
  persist();
}

// —— 师傅动作 ——
function generate(orderId) {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return;
  const layout = generateLayout(order.params);
  setState('orders', (o) => o.id === orderId, produce((o) => {
    o.facade = { ...layout };
    o.status = 'in_progress';
  }));
  persist();
}

function regenerateFacade(orderId, patch) {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return;
  const newParams = { ...order.params, ...patch };
  // 柱距随开间数联动建议（师傅可再手改）
  if (patch.bays && !patch.baySpacing) {
    newParams.baySpacing = Math.round((order.width - 300) / newParams.bays);
  }
  const oldState = order.facade
    ? { pieces: order.facade.pieces, zoneLocks: order.zoneLocks, params: order.params }
    : null;
  const next = order.facade
    ? regenerate(oldState, newParams)
    : { ...generateLayout(newParams), conflicts: [] };
  setState('orders', (o) => o.id === orderId, produce((o) => {
    o.params = newParams;
    o.facade = { zones: next.zones, pieces: next.pieces, conflicts: next.conflicts, meta: next.meta };
  }));
  persist();
}

function togglePieceLock(orderId, pieceId) {
  setState('orders', (o) => o.id === orderId, 'facade', 'pieces',
    (pc) => pc.id === pieceId,
    produce((pc) => { pc.locked = !pc.locked; if (pc.locked) pc.manual = true; }));
  persist();
}

function toggleZoneLock(orderId, zoneKey) {
  setState('orders', (o) => o.id === orderId, produce((o) => {
    const nowLocked = !o.zoneLocks[zoneKey];
    o.zoneLocks[zoneKey] = nowLocked;
    if (o.facade) {
      for (const pc of o.facade.pieces) {
        if (pc.zoneKey === zoneKey) {
          pc.locked = nowLocked;
          if (nowLocked) pc.manual = true;
        }
      }
    }
  }));
  persist();
}

function changePieceColor(orderId, pieceId, grade) {
  setState('orders', (o) => o.id === orderId, 'facade', 'pieces',
    (pc) => pc.id === pieceId,
    produce((pc) => { pc.colorGrade = grade; pc.manual = true; }));
  persist();
}

function changePieceMotif(orderId, pieceId, patch) {
  setState('orders', (o) => o.id === orderId, produce((o) => {
    const pc = o.facade.pieces.find((x) => x.id === pieceId);
    if (!pc) return;
    if (patch.newSeed) {
      o.manualSeedCounter += 1;
      pc.seed = seedFrom(o.id, 'manual', o.manualSeedCounter, pc.anchorSig);
    }
    if (patch.motifKey) pc.motifKey = patch.motifKey;
    if (patch.params) pc.motifParams = { ...pc.motifParams, ...patch.params };
    pc.manual = true;
  }));
  persist();
}

function decideConflict(orderId, conflictId, side) {
  setState('orders', (o) => o.id === orderId, produce((o) => {
    resolveConflict(o.facade, conflictId, side);
  }));
  persist();
}

function submitOrder(orderId) {
  setState('orders', (o) => o.id === orderId, produce((o) => {
    o.status = 'submitted';
  }));
  persist();
}

// —— 质检动作 ——
function qcPass(orderId) {
  setState('orders', (o) => o.id === orderId, produce((o) => {
    o.status = 'passed';
    o.qcHistory.push({ result: 'pass', at: new Date().toISOString() });
  }));
  persist();
}

function qcReject(orderId, reason) {
  setState('orders', (o) => o.id === orderId, produce((o) => {
    o.status = 'returned';
    o.reworkCount += 1;
    o.qcHistory.push({ result: 'reject', reason, at: new Date().toISOString() });
  }));
  persist();
}

function setCurrentOrder(orderId) {
  setState('currentOrderId', orderId);
  persist();
}

function setRole(role) {
  setState('role', role);
  persist();
}

function resetAll() {
  setState({ seq: 1, orders: [], currentOrderId: null, role: 'dispatcher' });
  persist();
}

export const store = {
  state,
  masters: MASTERS,
  currentOrder,
  dashboard: () => buildDashboard(state.orders),
  // 前台
  createOrder, assignMaster,
  // 师傅
  generate, regenerateFacade,
  togglePieceLock, toggleZoneLock,
  changePieceColor, changePieceMotif,
  decideConflict, submitOrder,
  // 质检
  qcPass, qcReject,
  // 导航
  setCurrentOrder, setRole, resetAll,
  todayPlus,
};
