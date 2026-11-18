import { create } from 'zustand';
import type {
  Feature,
  GridCell,
  LayerId,
  Placement,
  Student,
  Submission,
  Task,
} from './types';
import { generateData } from './data/generator';
import { gradeSubmission } from './lib/grading';

// ---------- 基础数据(内存,不持久化) ----------
const generated = generateData();
const featureMap = new Map<string, Feature>(generated.features.map((f) => [f.id, f]));

// ---------- 持久化部分 ----------
interface PersistState {
  overrides: Record<string, { layer?: LayerId; visible?: boolean }>;
  tasks: Task[];
  submissions: Submission[];
  role: 'coach' | 'student';
  currentStudentId: string;
}

const STORAGE_KEY = 'dsfm-state-v1';

function loadPersisted(): Partial<PersistState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<PersistState>;
  } catch {
    return {};
  }
}

function persist(get: () => AppStore) {
  const s = get();
  const data: PersistState = {
    overrides: s.overrides,
    tasks: s.tasks,
    submissions: s.submissions,
    role: s.role,
    currentStudentId: s.currentStudentId,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* 存储满时静默失败 */
  }
}

/** 更新状态并写入 localStorage */
function commit(set: (fn: (s: AppStore) => Partial<AppStore>) => void, get: () => AppStore, fn: (s: AppStore) => Partial<AppStore>) {
  set(fn);
  persist(get);
}

export interface ViewStats {
  lod: 0 | 1 | 2;
  zoom: number;
  visibleCells: number;
  visibleFeatures: number;
  totalCells: number;
}

export interface EffectiveProps {
  layer: LayerId;
  visible: boolean;
}

interface AppStore {
  // 数据
  features: Feature[];
  featureMap: Map<string, Feature>;
  grid: Map<string, GridCell>;
  layerCounts: Record<LayerId, number>;
  students: Student[];
  // 图层与覆盖
  layerVisible: Record<LayerId, boolean>;
  overrides: Record<string, { layer?: LayerId; visible?: boolean }>;
  // 选择
  selectedIds: string[];
  hoverId: string | null;
  blinkId: string | null;
  blinkNonce: number;
  focusNonce: number;
  focusTargetId: string | null;
  viewStats: ViewStats;
  // 角色
  role: 'coach' | 'student';
  currentStudentId: string;
  // 任务
  tasks: Task[];
  taskDraft: { pileIds: string[]; laneIds: string[] } | null;
  // 提交
  submissions: Submission[];
  placementMode: boolean;
  workingPlacements: Placement[];
  activeSubmissionId: string | null;
  // 场景重建信号
  sceneVersion: number;

  // actions
  toggleLayer: (id: LayerId) => void;
  setLayerVisible: (id: LayerId, v: boolean) => void;
  setSelected: (ids: string[]) => void;
  setHover: (id: string | null) => void;
  batchSetLayer: (ids: string[], layer: LayerId) => void;
  batchSetVisible: (ids: string[], visible: boolean) => void;
  resetOverrides: (ids: string[]) => void;
  searchAndLocate: (q: string) => Feature | null;
  setViewStats: (v: ViewStats) => void;
  setRole: (r: 'coach' | 'student') => void;
  setCurrentStudent: (id: string) => void;
  // 任务
  startTaskDraft: () => void;
  cancelTaskDraft: () => void;
  addDraftRefs: (ids: string[]) => void;
  removeDraftRef: (id: string) => void;
  createTask: (title: string, subject: string, requirement: string) => Task | null;
  deleteTask: (id: string) => void;
  // 提交
  setPlacementMode: (v: boolean) => void;
  upsertPlacement: (p: Placement) => void;
  removePlacement: (featureId: string) => void;
  clearPlacements: () => void;
  submitForTask: (taskId: string) => Submission | null;
  setActiveSubmission: (id: string | null) => void;
  setItemScore: (subId: string, featureId: string, score: number | null, comment: string) => void;
  finishReview: (subId: string, comment: string) => void;
  resetDemo: () => void;
}

function effectiveOf(
  f: Feature,
  overrides: Record<string, { layer?: LayerId; visible?: boolean }>,
  layerVisible: Record<LayerId, boolean>,
): EffectiveProps {
  const ov = overrides[f.id];
  const layer = ov?.layer ?? f.layer;
  const selfVis = ov?.visible ?? f.visible;
  const visible = layerVisible[layer] && (selfVis === null ? true : selfVis);
  return { layer, visible };
}

export function selectEffective(
  f: Feature,
  s: Pick<AppStore, 'overrides' | 'layerVisible'>,
): EffectiveProps {
  return effectiveOf(f, s.overrides, s.layerVisible);
}

const persisted = loadPersisted();

export const useStore = create<AppStore>((set, get) => ({
  features: generated.features,
  featureMap,
  grid: generated.grid,
  layerCounts: generated.layerCounts,
  students: generated.students,

  layerVisible: { base: true, lane: true, pile: true, sign: true, device: true },
  overrides: persisted.overrides ?? {},

  selectedIds: [],
  hoverId: null,
  blinkId: null,
  blinkNonce: 0,
  focusNonce: 0,
  focusTargetId: null,
  viewStats: { lod: 1, zoom: 1, visibleCells: 0, visibleFeatures: 0, totalCells: 0 },

  role: persisted.role ?? 'coach',
  currentStudentId: persisted.currentStudentId ?? generated.students[0].id,

  tasks: persisted.tasks ?? [],
  taskDraft: null,

  submissions: persisted.submissions ?? [],
  placementMode: false,
  workingPlacements: [],
  activeSubmissionId: null,
  sceneVersion: 0,

  toggleLayer: (id) => {
    commit(set, get, (s) => ({ layerVisible: { ...s.layerVisible, [id]: !s.layerVisible[id] } }));
  },
  setLayerVisible: (id, v) => {
    commit(set, get, (s) => ({ layerVisible: { ...s.layerVisible, [id]: v } }));
  },

  setSelected: (ids) => set({ selectedIds: ids }),
  setHover: (id) => set({ hoverId: id }),

  batchSetLayer: (ids, layer) =>
    commit(set, get, (s) => {
      const overrides = { ...s.overrides };
      for (const id of ids) {
        const f = featureMap.get(id);
        if (!f) continue;
        overrides[id] = { ...overrides[id], layer };
      }
      return { overrides, sceneVersion: s.sceneVersion + 1 };
    }),
  batchSetVisible: (ids, visible) =>
    commit(set, get, (s) => {
      const overrides = { ...s.overrides };
      for (const id of ids) {
        overrides[id] = { ...overrides[id], visible };
      }
      return { overrides, sceneVersion: s.sceneVersion + 1 };
    }),
  resetOverrides: (ids) =>
    commit(set, get, (s) => {
      const overrides = { ...s.overrides };
      for (const id of ids) delete overrides[id];
      return { overrides, sceneVersion: s.sceneVersion + 1 };
    }),

  searchAndLocate: (q) => {
    const key = q.trim().toUpperCase();
    if (!key) return null;
    let f = featureMap.get(key);
    if (!f) f = generated.features.find((x) => x.id.toUpperCase().startsWith(key));
    if (!f) f = generated.features.find((x) => x.label && x.label.includes(q.trim()));
    if (!f) return null;
    set((s) => ({
      blinkId: f!.id,
      blinkNonce: s.blinkNonce + 1,
      focusTargetId: f!.id,
      focusNonce: s.focusNonce + 1,
      selectedIds: [f!.id],
    }));
    return f;
  },

  setViewStats: (v) => set({ viewStats: v }),
  setRole: (r) => {
    set({ role: r, placementMode: false });
    persist(get);
  },
  setCurrentStudent: (id) => {
    set({ currentStudentId: id, workingPlacements: [], placementMode: false });
    persist(get);
  },

  startTaskDraft: () => set({ taskDraft: { pileIds: [], laneIds: [] } }),
  cancelTaskDraft: () => set({ taskDraft: null }),
  addDraftRefs: (ids) =>
    set((s) => {
      if (!s.taskDraft) return {};
      const draft = { pileIds: [...s.taskDraft.pileIds], laneIds: [...s.taskDraft.laneIds] };
      for (const id of ids) {
        const f = featureMap.get(id);
        if (!f) continue;
        if (f.layer === 'pile' && !draft.pileIds.includes(id)) draft.pileIds.push(id);
        if (f.layer === 'lane' && !draft.laneIds.includes(id)) draft.laneIds.push(id);
      }
      return { taskDraft: draft };
    }),
  removeDraftRef: (id) =>
    set((s) => {
      if (!s.taskDraft) return {};
      return {
        taskDraft: {
          pileIds: s.taskDraft.pileIds.filter((x) => x !== id),
          laneIds: s.taskDraft.laneIds.filter((x) => x !== id),
        },
      };
    }),
  createTask: (title, subject, requirement) => {
    const s = get();
    if (!s.taskDraft) return null;
    if (!s.taskDraft.pileIds.length && !s.taskDraft.laneIds.length) return null;
    const task: Task = {
      id: `TASK-${String(s.tasks.length + 1).padStart(4, '0')}`,
      title,
      subject,
      requirement,
      pileIds: s.taskDraft.pileIds,
      laneIds: s.taskDraft.laneIds,
      createdAt: Date.now(),
      creator: '李教练',
    };
    set((st) => ({ tasks: [...st.tasks, task], taskDraft: null }));
    persist(get);
    return task;
  },
  deleteTask: (id) =>
    commit(set, get, (s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  setPlacementMode: (v) => set({ placementMode: v }),
  upsertPlacement: (p) =>
    set((s) => {
      const rest = s.workingPlacements.filter((x) => x.featureId !== p.featureId);
      return { workingPlacements: [...rest, p] };
    }),
  removePlacement: (featureId) =>
    set((s) => ({ workingPlacements: s.workingPlacements.filter((x) => x.featureId !== featureId) })),
  clearPlacements: () => set({ workingPlacements: [] }),

  submitForTask: (taskId) => {
    const s = get();
    const task = s.tasks.find((t) => t.id === taskId);
    if (!task) return null;
    const result = gradeSubmission(task, s.workingPlacements, featureMap);
    const pileSet = new Set(task.pileIds);
    const sub: Submission = {
      id: `SUB-${Date.now()}`,
      taskId,
      student: s.currentStudentId,
      placements: s.workingPlacements.map((p) => ({ ...p })),
      pileScores: result.items.filter((i) => pileSet.has(i.featureId)),
      laneScores: result.items.filter((i) => !pileSet.has(i.featureId)),
      autoTotal: result.total,
      finalTotal: null,
      reviewed: false,
      reviewComment: '',
      submittedAt: Date.now(),
    };
    set((st) => ({
      submissions: [...st.submissions, sub],
      workingPlacements: [],
      placementMode: false,
      activeSubmissionId: sub.id,
    }));
    persist(get);
    return sub;
  },

  setActiveSubmission: (id) => set({ activeSubmissionId: id }),

  setItemScore: (subId, featureId, score, comment) =>
    commit(set, get, (s) => ({
      submissions: s.submissions.map((sub) => {
        if (sub.id !== subId) return sub;
        const map = (items: Submission['pileScores']) =>
          items.map((i) =>
            i.featureId === featureId
              ? { ...i, finalScore: score, comment: comment || i.comment }
              : i,
          );
        return { ...sub, pileScores: map(sub.pileScores), laneScores: map(sub.laneScores) };
      }),
    })),

  finishReview: (subId, comment) =>
    commit(set, get, (s) => ({
      submissions: s.submissions.map((sub) => {
        if (sub.id !== subId) return sub;
        const avg = (arr: typeof sub.pileScores) =>
          arr.length
            ? arr.reduce((sum, i) => sum + (i.finalScore ?? i.autoScore), 0) / arr.length
            : 0;
        // 与系统评分一致:桩位 60% + 车道 40%
        const finalTotal = Math.round(avg(sub.pileScores) * 0.6 + avg(sub.laneScores) * 0.4);
        return { ...sub, reviewed: true, finalTotal, reviewComment: comment };
      }),
    })),

  resetDemo: () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  },
}));
