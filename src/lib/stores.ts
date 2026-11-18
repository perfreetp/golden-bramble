import { writable, get } from 'svelte/store';
import type {
  FieldConfig,
  FieldState,
  ObstacleUnit,
  Problem,
  RobotPlan,
  Submission,
  UnitType,
} from './types';
import { generateField, regenerateField } from './generator';
import { evaluate } from './evaluation';
import { ALL_UNIT_TYPES } from './types';

const LS_KEY = 'robot-obstacle-course-v1';

export const DEFAULT_CONFIG: FieldConfig = {
  length: 12000,
  width: 8000,
  difficulty: 0.5,
  seed: 2026,
  sequence: ['steps', 'ramp', 'posts', 'bridge', 'gravel'],
};

interface PersistShape {
  field: FieldState;
  problems: Problem[];
  submissions: Submission[];
  currentProblemId: string | null;
}

function defaultState(): PersistShape {
  return {
    field: generateField(DEFAULT_CONFIG),
    problems: [],
    submissions: [],
    currentProblemId: null,
  };
}

function load(): PersistShape {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as PersistShape;
    if (!parsed.field?.units) return defaultState();
    return parsed;
  } catch {
    return defaultState();
  }
}

const initial = load();
export const fieldStore = writable<FieldState>(initial.field);
export const problemStore = writable<Problem[]>(initial.problems);
export const submissionStore = writable<Submission[]>(initial.submissions);
export const currentProblemId = writable<string | null>(initial.currentProblemId);
export const selectedUnitId = writable<string | null>(null);
export const wireframeOn = writable(false);

// 持久化
let saveTimer: ReturnType<typeof setTimeout> | undefined;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const data: PersistShape = {
      field: get(fieldStore),
      problems: get(problemStore),
      submissions: get(submissionStore),
      currentProblemId: get(currentProblemId),
    };
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }, 200);
}
fieldStore.subscribe(scheduleSave);
problemStore.subscribe(scheduleSave);
submissionStore.subscribe(scheduleSave);
currentProblemId.subscribe(scheduleSave);

// ---------- 场地动作 ----------

/** 按新配置全量生成（同种子同参数 => 完全一致） */
export function generateNew(config: FieldConfig) {
  fieldStore.set(generateField(config));
  selectedUnitId.set(null);
}

/** 重新生成：锁定单元不动，其余重排 */
export function regenerate(config?: FieldConfig) {
  fieldStore.update((f) => regenerateField(f, config));
}

export function updateUnit(unit: ObstacleUnit) {
  fieldStore.update((f) => ({
    ...f,
    units: f.units.map((u) => (u.id === unit.id ? structuredClone(unit) : u)),
  }));
}

export function toggleLock(id: string) {
  fieldStore.update((f) => ({
    ...f,
    units: f.units.map((u) => (u.id === id ? { ...u, locked: !u.locked } : u)),
  }));
  const u = get(fieldStore).units.find((x) => x.id === id);
  if (u?.locked) selectedUnitId.set(null);
}

export function rotateUnit(id: string, deltaDeg: number) {
  fieldStore.update((f) => ({
    ...f,
    units: f.units.map((u) => {
      if (u.id !== id || u.locked) return u;
      const r = (((u.rotation + deltaDeg) % 360) + 360) % 360;
      return { ...u, rotation: r };
    }),
  }));
}

export function addUnit(type: UnitType) {
  fieldStore.update((f) => {
    const rngIndex = f.nextId;
    const cfg = f.config;
    const state = regenerateField({
      ...f,
      units: [...f.units, { ...blankUnit(type, rngIndex) }],
    });
    return { ...state, nextId: rngIndex + 1 };
  });
}

function blankUnit(type: UnitType, rngIndex: number): ObstacleUnit {
  return {
    id: `u${rngIndex}`,
    type,
    position: { x: 0, z: 0 },
    rotation: 0,
    size: { w: 1000, d: 1000, h: 200 },
    params: {},
    locked: false,
    rngIndex,
  };
}

export function removeUnit(id: string) {
  fieldStore.update((f) => ({ ...f, units: f.units.filter((u) => u.id !== id) }));
  selectedUnitId.set(null);
}

// ---------- 出题 / 提交 / 复核 ----------

export function saveProblem(title: string): string {
  const id = `P-${Date.now().toString(36)}`;
  const problem: Problem = { id, title, field: structuredClone(get(fieldStore)), createdAt: Date.now() };
  problemStore.update((ps) => [problem, ...ps]);
  currentProblemId.set(id);
  return id;
}

export function loadProblem(id: string) {
  const p = get(problemStore).find((x) => x.id === id);
  if (!p) return;
  fieldStore.set(structuredClone(p.field));
  currentProblemId.set(id);
  selectedUnitId.set(null);
}

export function deleteProblem(id: string) {
  problemStore.update((ps) => ps.filter((p) => p.id !== id));
  if (get(currentProblemId) === id) currentProblemId.set(null);
}

export function submitPlan(studentName: string, teamName: string, plan: RobotPlan): Submission {
  const field = structuredClone(get(fieldStore));
  const evaluation = evaluate(field, plan);
  const sub: Submission = {
    id: `S-${Date.now().toString(36)}`,
    problemId: get(currentProblemId) ?? '未保存题目',
    fieldSnapshot: field,
    studentName,
    teamName,
    plan,
    evaluation,
    reviewScore: null,
    reviewComment: '',
    createdAt: Date.now(),
    reviewedAt: null,
  };
  submissionStore.update((ss) => [sub, ...ss]);
  return sub;
}

export function reviewSubmission(id: string, reviewScore: number, reviewComment: string) {
  submissionStore.update((ss) =>
    ss.map((s) =>
      s.id === id
        ? { ...s, reviewScore: Math.max(0, Math.min(30, reviewScore)), reviewComment, reviewedAt: Date.now() }
        : s,
    ),
  );
}

export function resetAll() {
  const d = defaultState();
  fieldStore.set(d.field);
  problemStore.set(d.problems);
  submissionStore.set(d.submissions);
  currentProblemId.set(d.currentProblemId);
  selectedUnitId.set(null);
}

export { ALL_UNIT_TYPES };
