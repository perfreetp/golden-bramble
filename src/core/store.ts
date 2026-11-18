import type { Klass, Project, Role, Submission, Task } from './types.js';

type StoreMap = {
  tasks: Task[];
  projects: Project[];
  submissions: Submission[];
  klasses: Klass[];
  role: Role;
  currentStudentId: string;
};

type StoreKey = keyof StoreMap;
type Listener = () => void;

const PREFIX = 'rdap.v1.';

function read<T>(key: StoreKey, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: StoreKey, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('持久化失败', e);
  }
}

class AppStore {
  private listeners = new Set<Listener>();

  tasks: Task[] = read('tasks', []);
  projects: Project[] = read('projects', []);
  submissions: Submission[] = read('submissions', []);
  klasses: Klass[] = read('klasses', []);
  role: Role = read<Role>('role', 'student');
  currentStudentId: string = read('currentStudentId', 's1');

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    this.listeners.forEach((fn) => fn());
  }

  save(): void {
    write('tasks', this.tasks);
    write('projects', this.projects);
    write('submissions', this.submissions);
    write('klasses', this.klasses);
    write('role', this.role);
    write('currentStudentId', this.currentStudentId);
    this.emit();
  }

  setRole(role: Role): void {
    this.role = role;
    this.save();
  }

  /* ---------- 任务 ---------- */
  upsertTask(task: Task): void {
    const i = this.tasks.findIndex((t) => t.id === task.id);
    if (i >= 0) this.tasks[i] = task;
    else this.tasks.push(task);
    this.save();
  }

  getTask(id: string): Task | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  /* ---------- 工程 ---------- */
  upsertProject(project: Project): void {
    const i = this.projects.findIndex((p) => p.id === project.id);
    if (i >= 0) this.projects[i] = project;
    else this.projects.push(project);
    this.save();
  }

  getProject(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }

  projectForStudentTask(studentId: string, taskId: string): Project | undefined {
    return this.projects.find((p) => p.studentId === studentId && p.taskId === taskId);
  }

  /* ---------- 提交 ---------- */
  upsertSubmission(sub: Submission): void {
    const i = this.submissions.findIndex((s) => s.id === sub.id);
    if (i >= 0) this.submissions[i] = sub;
    else this.submissions.push(sub);
    this.save();
  }

  submissionOfProject(projectId: string): Submission | undefined {
    return this.submissions.find((s) => s.projectId === projectId);
  }

  /* ---------- 班级 ---------- */
  getKlass(id: string): Klass | undefined {
    return this.klasses.find((k) => k.id === id);
  }

  /** 清空并重新播种（演示用） */
  reseed(data: Pick<StoreMap, 'tasks' | 'klasses' | 'projects' | 'submissions'>): void {
    this.tasks = data.tasks;
    this.klasses = data.klasses;
    this.projects = data.projects;
    this.submissions = data.submissions;
    this.save();
  }
}

export const store = new AppStore();
