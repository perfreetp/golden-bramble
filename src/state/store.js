import { createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import { runChecks } from '../qc/checks';

let uid = 0;
export const nextId = (p) =>
  p + Date.now().toString(36) + (uid++).toString(36) + Math.random().toString(36).slice(2, 6);

// ---------- 模型 ----------
export const [models, setModels] = createSignal([]);
export const [currentId, setCurrentId] = createSignal(null);
export const currentModel = () => models().find((m) => m.id === currentId()) || null;

export const [voxVersion, setVoxVersion] = createSignal(0);
export function notifyVoxels() {
  setVoxVersion((v) => v + 1);
  scheduleSave();
}

// ---------- 编辑器状态 ----------
export const [editor, setEditor] = createStore({
  tab: 'edit',          // edit | qc
  mode: 'add',          // add | subtract | paint | select
  color: 0,
  currentZ: 0,
  solo: false,          // 只看当前层
  mirrorX: false,
  mirrorY: false,
  selection: null,      // {x0,y0,x1,y1}，Z 范围用 selZ0/selZ1
  selZ0: 0,
  selZ1: 0,
  clipboard: null,
  pasteActive: false,
  pasteAnchor: null,
  angleDeg: 12,         // 减面：角度阈值
  minEdge: 0,           // 减面：最小边长 mm
  hint: '',
  hintKind: 'info',
});

let hintTimer = 0;
export function showHint(text, kind = 'info') {
  setEditor('hint', text);
  setEditor('hintKind', kind);
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => setEditor('hint', ''), 4500);
}

export function cancelPaste() {
  setEditor('pasteActive', false);
  setEditor('pasteAnchor', null);
}

export function addModel(cfg) {
  const m = {
    id: nextId('m'),
    name: cfg.name,
    cellMm: cfg.cellMm,
    nx: cfg.nx, ny: cfg.ny, nz: cfg.nz,
    voxels: new Map(),
    createdAt: Date.now(),
  };
  setModels((ms) => [...ms, m]);
  setCurrentId(m.id);
  resetEditorForModel();
  scheduleSave();
  return m;
}

export function deleteModel(id) {
  setModels((ms) => ms.filter((m) => m.id !== id));
  setBatches((bs) => bs.map((b) => ({ ...b, modelIds: b.modelIds.filter((x) => x !== id) })));
  if (currentId() === id) setCurrentId(models()[0]?.id ?? null);
  scheduleSave();
}

export function resetEditorForModel() {
  setEditor('currentZ', 0);
  setEditor('selection', null);
  setEditor('selZ0', 0);
  setEditor('selZ1', 0);
  cancelPaste();
}

// 对模型做结构性修改（整体变换等）
export function mutateModel(id, fn) {
  const m = models().find((x) => x.id === id);
  if (!m) return;
  fn(m);
  setModels((ms) => [...ms]);
  notifyVoxels();
}

// ---------- 批次质检 ----------
export const [batches, setBatches] = createSignal([]);
export const [activeBatchId, setActiveBatchId] = createSignal(null);
export const activeBatch = () => batches().find((b) => b.id === activeBatchId()) || null;

function updateBatch(id, patch) {
  setBatches((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  scheduleSave();
}

export function createBatch({ name, supplier, deadline, modelIds }) {
  const b = {
    id: nextId('b'),
    name, supplier, deadline, modelIds,
    status: '待质检',
    rework: 0,
    issues: [],
    history: [{ t: Date.now(), text: '批次创建' }],
  };
  setBatches((bs) => [...bs, b]);
  setActiveBatchId(b.id);
  scheduleSave();
  return b;
}

export function deleteBatch(id) {
  setBatches((bs) => bs.filter((b) => b.id !== id));
  if (activeBatchId() === id) setActiveBatchId(null);
  scheduleSave();
}

export function runBatchChecks(id) {
  const b = batches().find((x) => x.id === id);
  if (!b) return;
  const issues = [];
  for (const mid of b.modelIds) {
    const m = models().find((x) => x.id === mid);
    if (!m) {
      issues.push({ id: nextId('i'), modelId: mid, modelName: '（模型已删除）', sev: '严重', msg: '批次引用的模型已被删除', review: 'pending' });
      continue;
    }
    for (const iss of runChecks(m))
      issues.push({ id: nextId('i'), modelId: mid, modelName: m.name, sev: iss.sev, msg: iss.msg, review: 'pending' });
  }
  const sev = issues.filter((i) => i.sev === '严重').length;
  const adv = issues.length - sev;
  updateBatch(id, {
    issues,
    status: '复核中',
    history: [...b.history, { t: Date.now(), text: `自动质检完成：严重 ${sev} 条，不建议 ${adv} 条` }],
  });
}

export function reviewIssue(batchId, issueId, verdict) {
  const b = batches().find((x) => x.id === batchId);
  if (!b) return;
  updateBatch(batchId, {
    issues: b.issues.map((i) => (i.id === issueId ? { ...i, review: verdict } : i)),
  });
}

export function canPass(b) {
  return (
    b &&
    b.status === '复核中' &&
    b.issues.every((i) => i.review !== 'pending') &&
    !b.issues.some((i) => i.review === 'confirmed' && i.sev === '严重')
  );
}

export function passBatch(id) {
  const b = batches().find((x) => x.id === id);
  if (!b || !canPass(b)) return;
  updateBatch(id, {
    status: '已放行',
    history: [...b.history, { t: Date.now(), text: '复核完成，整批达标，予以放行' }],
  });
}

export function returnBatch(id) {
  const b = batches().find((x) => x.id === id);
  if (!b) return;
  const rework = b.rework + 1;
  updateBatch(id, {
    status: '已退回',
    rework,
    history: [...b.history, { t: Date.now(), text: `整批不达标，退回供应方（第 ${rework} 次返工）` }],
  });
}

// ---------- 持久化 ----------
const LS_KEY = 'voxel-toy-workbench-v1';
let saveTimer = 0;
export function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 400);
}
function saveNow() {
  try {
    const data = {
      models: models().map((m) => ({ ...m, voxels: [...m.voxels.entries()] })),
      batches: batches(),
      currentId: currentId(),
    };
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch (e) { /* 存储失败不阻塞 */ }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    setModels((d.models || []).map((m) => ({ ...m, voxels: new Map(m.voxels) })));
    setBatches(d.batches || []);
    setCurrentId(d.currentId ?? null);
    return models().length > 0;
  } catch (e) {
    return false;
  }
}

// ---------- 演示数据 ----------
export function seedIfEmpty() {
  if (models().length > 0) return;
  const m = addModel({ name: '磨牙骨-演示', cellMm: 8, nx: 28, ny: 14, nz: 12 });
  const cy = (m.ny - 1) / 2, cz = (m.nz - 1) / 2;
  for (let x = 0; x < m.nx; x++)
    for (let y = 0; y < m.ny; y++)
      for (let z = 0; z < m.nz; z++) {
        const dy = y - cy, dz = z - cz;
        let c = -1;
        if (x >= 4 && x <= 23 && Math.hypot(dy, dz) <= 3.0) c = 0; // 骨身：珊瑚红
        const d1 = Math.hypot(x - 4, dy, dz);
        const d2 = Math.hypot(x - 23, dy, dz);
        if (d1 <= 5.0 || d2 <= 5.0) c = 1; // 两端结球：奶油黄
        if (c >= 0) m.voxels.set(x + ',' + y + ',' + z, c);
      }
  notifyVoxels();
  createBatch({
    name: 'B-20261119-01',
    supplier: '东莞某橡塑厂',
    deadline: Date.now() + 5 * 864e5,
    modelIds: [m.id],
  });
}
