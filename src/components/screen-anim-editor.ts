import type { Project, Submission } from '../core/types.js';
import { store } from '../core/store.js';
import { uid, downloadBlob } from '../core/math.js';
import { h, SHARED_CSS, toast } from './dom.js';
import { buildRobotSkeleton } from '../skeleton/presets.js';
import { clampToLimit } from '../skeleton/skeleton.js';
import {
  putKeyframe, autoGrade, trackOf,
} from '../anim/timeline.js';
import { sampleTrack } from '../core/easing.js';
import { exportProjectFile, exportSequenceFrames, importProjectFile } from '../anim/exporter.js';
import type { EditorViewport } from './editor-viewport.js';
import type { PanelHierarchy } from './panel-hierarchy.js';
import type { PanelTimeline } from './panel-timeline.js';
import type { PanelCurve } from './panel-curve.js';

export class ScreenAnimEditor extends HTMLElement {
  private project!: Project;
  private taskId = '';
  private selectedBoneId: string | null = null;
  private currentFrame = 0;

  private viewport!: EditorViewport;
  private hierarchy!: PanelHierarchy;
  private timeline!: PanelTimeline;
  private curve!: PanelCurve;
  private titleEl!: HTMLSpanElement;

  connectedCallback(): void {
    const hash = location.hash;
    const m = hash.match(/#\/editor(?:\/([^/?]+))?/);
    this.taskId = m?.[1] ? decodeURIComponent(m[1]) : store.tasks[0]?.id ?? '';
    const task = store.getTask(this.taskId);    if (!task) {
      this.attachShadow({ mode: 'open' }).appendChild(
        h('div', { style: 'padding:40px;color:#93a1bd', textContent: '任务不存在，请从任务大厅进入。' }),
      );
      return;
    }

    const existing = store.projectForStudentTask(store.currentStudentId, this.taskId);
    this.project = existing ?? this.createProject();

    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = /* html */ `
      <style>
        ${SHARED_CSS}
        :host { display: flex; flex-direction: column; height: 100%; }
        .topbar {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 14px; border-bottom: 1px solid var(--border);
          background: var(--bg-panel); flex: none;
        }
        .topbar .title { font-weight: 600; font-size: 14px; }
        .topbar .sub { color: var(--fg-faint); font-size: 12px; }
        .grow { flex: 1; }
        .main { flex: 1; min-height: 0; display: flex; }
        .col-left { width: 280px; flex: none; border-right: 1px solid var(--border); min-height: 0; }
        .col-center { flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 0; }
        .viewport-host { flex: 1; min-height: 0; position: relative; }
        .timeline-host { height: 260px; flex: none; border-top: 1px solid var(--border); }
        .col-right { width: 300px; flex: none; border-left: 1px solid var(--border); min-height: 0; }
        .frame-readout { font-family: var(--mono, monospace); color: var(--warn); font-size: 12px; }
        input[type="file"] { display: none; }
      </style>
      <div class="topbar">
        <div>
          <div class="title" id="title"></div>
          <div class="sub" id="sub"></div>
        </div>
        <span class="frame-readout" id="readout"></span>
        <div class="grow"></div>
        <button id="save">💾 保存工程</button>
        <button id="export-proj">⬇ 工程文件</button>
        <button id="export-frames">⬇ 序列帧</button>
        <button id="import-proj">⬆ 导入工程</button>
        <input type="file" id="file-input" accept=".json,application/json" />
        <button class="primary" id="submit">📤 提交考核</button>
        <a href="#/tasks"><button class="ghost">← 返回大厅</button></a>
      </div>
      <div class="main">
        <div class="col-left"><panel-hierarchy></panel-hierarchy></div>
        <div class="col-center">
          <div class="viewport-host"><editor-viewport></editor-viewport></div>
          <div class="timeline-host"><panel-timeline></panel-timeline></div>
        </div>
        <div class="col-right"><panel-curve></panel-curve></div>
      </div>
    `;

    this.titleEl = root.querySelector('#title')!;
    root.querySelector('#sub')!.textContent = `任务：${task.title} · 评分要求 ${task.rubric.minKeyframes} 关键帧 / 摆幅 ${task.rubric.angleRangeDeg}° / ${task.rubric.durationSec}s`;
    // 等待子自定义元素完成升级，避免拿到 HTMLUnknownElement
    void Promise.all([
      customElements.whenDefined('editor-viewport'),
      customElements.whenDefined('panel-hierarchy'),
      customElements.whenDefined('panel-timeline'),
      customElements.whenDefined('panel-curve'),
    ]).then(() => this.initChildren(task));

    root.querySelector('#save')!.addEventListener('click', () => this.save());
    root.querySelector('#export-proj')!.addEventListener('click', () => exportProjectFile(this.project));
    root.querySelector('#export-frames')!.addEventListener('click', async () => {
      toast('正在离屏渲染序列帧…', 'info');
      try {
        await exportSequenceFrames(this.project);
        toast('序列帧精灵图与帧索引已导出', 'good');
      } catch (e) {
        toast(`导出失败：${(e as Error).message}`, 'bad');
      }
    });
    const fileInput = root.querySelector<HTMLInputElement>('#file-input')!;
    root.querySelector('#import-proj')!.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      try {
        const imported = await importProjectFile(file);
        imported.id = this.project.id;
        imported.studentId = store.currentStudentId;
        imported.taskId = this.taskId;
        this.project = imported;
        store.upsertProject(this.project);
        toast('工程已导入并保存', 'good');
        location.reload();
      } catch (e) {
        toast((e as Error).message, 'bad');
      }
    });
    root.querySelector('#submit')!.addEventListener('click', () => this.submit());
  }

  private initChildren(task: { rubric: { jumpTolerance: number } }): void {
    const root = this.shadowRoot!;
    this.viewport = root.querySelector('editor-viewport')!;
    this.hierarchy = root.querySelector('panel-hierarchy')!;
    this.timeline = root.querySelector('panel-timeline')!;
    this.curve = root.querySelector('panel-curve')!;
    this.viewport.setProject(this.project);
    this.hierarchy.setProject(this.project);
    this.timeline.setProject(this.project, task.rubric.jumpTolerance);
    this.curve.setProject(this.project);
    this.wireEvents();
    this.refreshTitle();
  }

  private createProject(): Project {
    return {
      id: uid('proj'),
      taskId: this.taskId,
      studentId: store.currentStudentId,
      name: `${store.getTask(this.taskId)?.title ?? '舞蹈'}-${store.currentStudentId}`,
      fps: 12,
      frameCount: 72,
      skeleton: buildRobotSkeleton(),
      keyframes: [],
      updatedAt: Date.now(),
      submitted: false,
    };
  }

  private wireEvents(): void {
    this.viewport.setEvents({
      onSelect: (boneId) => {
        this.selectedBoneId = boneId;
        this.hierarchy.setSelected(boneId);
        this.viewport.setSelected(boneId);
        this.curve.setSelectedBone(boneId);
      },
      onDragAngle: ({ boneId, angle }) => {
        const bone = this.project.skeleton.find((b) => b.id === boneId);
        if (!bone) return;
        const finalAngle = clampToLimit(bone, angle);
        // 正在播放头帧上有该骨骼关键帧则实时改写，否则先只改视图姿态（通过临时角度表）
        const existing = this.project.keyframes.find(
          (k) => k.boneId === boneId && k.frame === this.currentFrame,
        );
        if (existing) {
          existing.angle = finalAngle;
          this.timeline.render();
          this.curve.setFrame(this.currentFrame);
        } else {
          this.temporaryAngles.set(boneId, finalAngle);
        }
        this.viewport.setTempAngles(this.temporaryAngles);
        this.viewport.setFrame(this.currentFrame);
        this.refreshReadout(boneId, finalAngle);
      },
      onDragEnd: () => {
        // 松手时若播放头无关键帧，自动落一个关键帧（符合"拖动即打点"直觉）
        if (this.selectedBoneId) {
          const angle = this.temporaryAngles.get(this.selectedBoneId);
          if (angle !== undefined) {
            this.putKf(this.selectedBoneId, this.currentFrame, angle);
            this.temporaryAngles.delete(this.selectedBoneId);
          }
        }
        this.afterMutation();
      },
    });

    this.hierarchy.setEvents({
      onSelect: (boneId) => {
        this.selectedBoneId = boneId;
        this.viewport.setSelected(boneId);
        this.curve.setSelectedBone(boneId);
      },
      onChange: () => this.afterMutation(),
    });

    this.timeline.setEvents({
      onFrameChange: (frame) => {
        this.currentFrame = frame;
        this.viewport.setFrame(frame);
        this.curve.setFrame(frame);
        this.refreshReadout();
      },
      onPlayState: () => undefined,
      onChange: () => this.afterMutation(),
    });

    this.timeline.addEventListener('request-keyframe', ((e: CustomEvent<{ boneId: string | null; frame: number }>) => {
      const boneId = e.detail.boneId ?? this.selectedBoneId;
      if (!boneId) {
        toast('请先选择一根骨骼', 'warn');
        return;
      }
      const angle = this.angleAt(boneId, e.detail.frame);
      this.putKf(boneId, e.detail.frame, angle);
      this.afterMutation();
    }) as EventListener);

    this.curve.setEvents({
      onChange: () => this.afterMutation(true),
      onPersist: () => this.save(true),
      onSeek: (frame) => {
        this.currentFrame = frame;
        this.viewport.setFrame(frame);
        this.timeline.setFrame(frame);
      },
    });
  }

  private temporaryAngles = new Map<string, number>();

  /** 某骨骼在某帧的当前角度（含拖拽中的临时角） */
  private angleAt(boneId: string, frame: number): number {
    const temp = this.temporaryAngles.get(boneId);
    if (temp !== undefined && frame === this.currentFrame) return temp;
    const bone = this.project.skeleton.find((b) => b.id === boneId);
    const v = sampleTrack(trackOf(this.project, boneId), frame);
    return v ?? bone?.restAngle ?? 0;
  }

  private putKf(boneId: string, frame: number, angle: number): void {
    const bone = this.project.skeleton.find((b) => b.id === boneId);
    const finalAngle = bone ? clampToLimit(bone, angle) : angle;
    const existing = this.project.keyframes.find((k) => k.boneId === boneId && k.frame === frame);
    if (existing) {
      existing.angle = finalAngle;
      toast(`已更新第 ${frame} 帧关键帧`, 'info');
    } else {
      putKeyframe(this.project, boneId, frame, finalAngle, 'linear');
      toast(`已在第 ${frame} 帧为 ${bone?.name ?? '骨骼'} 打点`, 'good');
    }
  }

  private afterMutation(persist = true): void {
    this.timeline.refreshJumps();
    this.timeline.render();
    this.curve.setProject(this.project);
    this.curve.setSelectedBone(this.selectedBoneId);
    this.curve.setFrame(this.currentFrame);
    this.hierarchy.setProject(this.project);
    if (persist) this.save(true);
  }

  private save(silent = false): void {
    this.project.updatedAt = Date.now();
    store.upsertProject(this.project);
    this.refreshTitle();
    if (!silent) toast('工程已保存到本地', 'good');
  }

  private refreshTitle(): void {
    const sub = store.submissionOfProject(this.project.id);
    const status = sub
      ? sub.status === 'reviewed'
        ? `已复核 ${sub.teacherScore !== null ? sub.autoScore + sub.teacherScore : sub.autoScore} 分`
        : '已提交 · 待教师复核'
      : this.project.submitted
        ? '已提交'
        : '未提交';
    this.titleEl.textContent = `🎬 ${this.project.name}（${status}）`;
  }

  private refreshReadout(boneId?: string, angle?: number): void {
    const el = this.shadowRoot?.querySelector('#readout');
    if (!el) return;
    const id = boneId ?? this.selectedBoneId;
    if (!id) {
      el.textContent = `帧 ${this.currentFrame}`;
      return;
    }
    const bone = this.project.skeleton.find((b) => b.id === id);
    const a = angle ?? this.angleAt(id, this.currentFrame);
    el.textContent = `帧 ${this.currentFrame} · ${bone?.name ?? ''} 局部角 ${a.toFixed(0)}°`;
  }

  private submit(): void {
    if (this.project.keyframes.length === 0) {
      toast('还没有任何关键帧，无法提交', 'bad');
      return;
    }
    this.save(true);
    const task = store.getTask(this.taskId)!;
    const grade = autoGrade(this.project, task.rubric);
    const existing = store.submissionOfProject(this.project.id);
    const sub: Submission = existing ?? {
      id: uid('sub'),
      projectId: this.project.id,
      taskId: this.taskId,
      studentId: store.currentStudentId,
      klassId: store.klasses[0]?.id ?? 'k1',
      status: 'submitted',
      autoMax: 60,
      teacherMax: 40,
      errors: [],
      teacherComment: '',
      submittedAt: Date.now(),
      reviewedAt: null,
      teacherScore: null,
      autoScore: 0,
      autoItems: [],
      jumpFrames: [],
    };
    sub.autoScore = grade.total;
    sub.autoItems = grade.items;
    sub.jumpFrames = grade.jumpFrames;
    sub.status = 'submitted';
    sub.teacherScore = null;
    sub.reviewedAt = null;
    sub.submittedAt = Date.now();
    store.upsertSubmission(sub);
    this.project.submitted = true;
    store.upsertProject(this.project);
    this.refreshTitle();
    toast(`提交成功！自动评分 ${grade.total}/60，等待教师复核`, 'good');
    const report = grade.items.map((it) => `${it.label}: ${it.got}/${it.max}`).join('\n');
    downloadBlob(
      new Blob([`自动评分报告（${this.project.name}）\n\n${report}\n\n合计：${grade.total}/60\n跳变帧：${grade.jumpFrames.join(', ') || '无'}\n`],
        { type: 'text/plain;charset=utf-8' }),
      `${this.project.name}-自动评分.txt`,
    );
  }
}
