// 本地持久化：项目文档 / 版本记录 / 批注
import type { Annotation, SprayDoc, VersionRecord } from '../types';

const PROJECT_KEY = 'spray-editor:project';
const VERSIONS_KEY = 'spray-editor:versions';
const ANNO_KEY = 'spray-editor:annotations';

export interface ProjectFile {
  fileName: string;
  savedAt: number;
  doc: SprayDoc;
  /** 打开文件时的基线快照，保证可连续回退到该状态 */
  baseline: SprayDoc;
}

export function saveProject(file: ProjectFile): void {
  localStorage.setItem(PROJECT_KEY, JSON.stringify(file));
}

export function loadProject(): ProjectFile | null {
  const raw = localStorage.getItem(PROJECT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ProjectFile;
  } catch {
    return null;
  }
}

export function clearProject(): void {
  localStorage.removeItem(PROJECT_KEY);
}

export function saveVersions(versions: VersionRecord[]): void {
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
}

export function loadVersions(): VersionRecord[] {
  try {
    return (JSON.parse(localStorage.getItem(VERSIONS_KEY) ?? '[]') as VersionRecord[]) ?? [];
  } catch {
    return [];
  }
}

export function saveAnnotations(a: Annotation[]): void {
  localStorage.setItem(ANNO_KEY, JSON.stringify(a));
}

export function loadAnnotations(): Annotation[] {
  try {
    return (JSON.parse(localStorage.getItem(ANNO_KEY) ?? '[]') as Annotation[]) ?? [];
  } catch {
    return [];
  }
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(URL.createObjectURL(blob), filename);
}

export function triggerDownload(url: string, filename: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
