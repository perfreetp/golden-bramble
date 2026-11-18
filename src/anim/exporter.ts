import type { Project } from '../core/types.js';
import { downloadBlob } from '../core/math.js';
import { sampleTrack } from '../core/easing.js';
import { createOffscreenRenderer, COLOR, type Renderer } from '../gpu/renderer.js';
import { solveFK, type SkeletonPose } from '../skeleton/skeleton.js';
import { drawRobot } from '../skeleton/draw.js';
import { trackOf } from './timeline.js';

/** 导出工程文件（.json） */
export function exportProjectFile(project: Project): void {
  const payload = {
    format: 'robot-dance-project',
    version: 1,
    exportedAt: new Date().toISOString(),
    project,
  };
  downloadBlob(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
    `${sanitize(project.name)}.rdproj.json`,
  );
}

export function importProjectFile(file: File): Promise<Project> {
  return file.text().then((text) => {
    const data = JSON.parse(text) as { project?: Project; format?: string };
    if (data.format !== 'robot-dance-project' || !data.project) {
      throw new Error('工程文件格式不正确');
    }
    return data.project;
  });
}

function sanitize(name: string): string {
  return name.replace(/[\\/:*?"<>|\s]+/g, '_');
}

/** 计算某帧每根骨骼的局部角（无轨道则用静止角） */
export function poseAtFrame(project: Project, frame: number): Map<string, number> {
  const angles = new Map<string, number>();
  for (const bone of project.skeleton) {
    const track = trackOf(project, bone.id);
    const v = sampleTrack(track, frame);
    angles.set(bone.id, v ?? bone.restAngle);
  }
  return angles;
}

function computeBounds(pose: SkeletonPose): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of pose.ordered) {
    minX = Math.min(minX, p.start.x, p.end.x);
    minY = Math.min(minY, p.start.y, p.end.y);
    maxX = Math.max(maxX, p.start.x, p.end.x);
    maxY = Math.max(maxY, p.start.y, p.end.y);
  }
  return { minX, minY, maxX, maxY };
}

/**
 * 离屏逐帧渲染并打包精灵图：
 * 先跑一遍求统一包围盒，再把每帧画进固定尺寸格子，按方形网格排布。
 */
export async function exportSpriteSheet(
  project: Project,
  cellSize = 240,
): Promise<{ sheet: Blob; index: Blob }> {
  // 第一遍：求所有帧的统一包围盒
  let bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (let f = 0; f < project.frameCount; f++) {
    const pose = solveFK(project.skeleton, poseAtFrame(project, f));
    const b = computeBounds(pose);
    bounds = {
      minX: Math.min(bounds.minX, b.minX),
      minY: Math.min(bounds.minY, b.minY),
      maxX: Math.max(bounds.maxX, b.maxX),
      maxY: Math.max(bounds.maxY, b.maxY),
    };
  }
  const pad = 24;
  const bw = bounds.maxX - bounds.minX || 1;
  const bh = bounds.maxY - bounds.minY || 1;
  const zoom = Math.min((cellSize - pad * 2) / bw, (cellSize - pad * 2) / bh);
  // 让包围盒中心对齐格子中心
  const camFor = (col: number, row: number) => ({
    x: col * cellSize + cellSize / 2 - ((bounds.minX + bounds.maxX) / 2) * zoom,
    y: row * cellSize + cellSize / 2 - ((bounds.minY + bounds.maxY) / 2) * zoom,
    zoom,
  });

  const cols = Math.ceil(Math.sqrt(project.frameCount));
  const rows = Math.ceil(project.frameCount / cols);
  const width = cols * cellSize;
  const height = rows * cellSize;
  const { renderer, canvas } = createOffscreenRenderer(width, height);
  const bg = COLOR.opaque(0x0f1420);

  const frames: Array<{ frame: number; x: number; y: number; w: number; h: number }> = [];
  for (let f = 0; f < project.frameCount; f++) {
    const col = f % cols;
    const row = Math.floor(f / cols);
    const cam = camFor(col, row);
    renderer.begin(cam, bg);
    const pose = solveFK(project.skeleton, poseAtFrame(project, f));
    drawRobot(renderer, project.skeleton, pose);
    renderer.end();
    frames.push({ frame: f, x: col * cellSize, y: row * cellSize, w: cellSize, h: cellSize });
  }

  const sheet = await canvas.convertToBlob({ type: 'image/png' });
  const indexPayload = {
    format: 'robot-dance-sprites',
    version: 1,
    name: project.name,
    fps: project.fps,
    frameCount: project.frameCount,
    cellSize,
    cols,
    rows,
    frames,
  };
  const index = new Blob([JSON.stringify(indexPayload, null, 2)], { type: 'application/json' });
  return { sheet, index };
}

export async function exportSequenceFrames(project: Project): Promise<void> {
  const { sheet, index } = await exportSpriteSheet(project);
  downloadBlob(sheet, `${sanitize(project.name)}.sprites.png`);
  setTimeout(() => {
    downloadBlob(index, `${sanitize(project.name)}.frames.json`);
  }, 300);
}

/** 供考核回放/缩略图使用：把某帧渲染成 dataURL */
export function renderFrameDataURL(project: Project, frame: number, size = 320): string {
  const { renderer, canvas } = createOffscreenRenderer(size, size);
  const pose = solveFK(project.skeleton, poseAtFrame(project, frame));
  const b = computeBounds(pose);
  const pad = 28;
  const zoom = Math.min((size - pad * 2) / (b.maxX - b.minX || 1), (size - pad * 2) / (b.maxY - b.minY || 1));
  const cam = {
    x: size / 2 - ((b.minX + b.maxX) / 2) * zoom,
    y: size / 2 - ((b.minY + b.maxY) / 2) * zoom,
    zoom,
  };
  renderer.begin(cam, COLOR.opaque(0x0f1420));
  drawRobot(renderer, project.skeleton, pose);
  renderer.end();
  return canvasToDataURL(canvas);
}

function canvasToDataURL(canvas: OffscreenCanvas): string {
  // OffscreenCanvas 无 toDataURL，经由 2D canvas 转换
  const c = document.createElement('canvas');
  c.width = canvas.width;
  c.height = canvas.height;
  c.getContext('2d')!.drawImage(canvas, 0, 0);
  return c.toDataURL('image/png');
}

export type { Renderer };
