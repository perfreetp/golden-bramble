import type { Project, Submission } from '../core/types.js';
import { store } from '../core/store.js';
import { h, clear, SHARED_CSS, toast } from './dom.js';
import { createRenderer, COLOR, type Renderer } from '../gpu/renderer.js';
import { solveFK } from '../skeleton/skeleton.js';
import { drawRobot } from '../skeleton/draw.js';
import { poseAtFrame } from '../anim/exporter.js';

const ERROR_TAGS = ['限位违规', '曲线突变', '帧数不足', '摆幅不够', '时长不符', '动作单一', '层级绑定错误'];

export class ScreenGradeReview extends HTMLElement {
  private selectedSubId: string | null = null;
  private renderer: Renderer | null = null;
  private canvas!: HTMLCanvasElement;
  private playRaf = 0;
  private playFrame = 0;
  private project: Project | null = null;

  connectedCallback(): void {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = /* html */ `
      <style>
        ${SHARED_CSS}
        :host { display: block; height: 100%; overflow: hidden; }
        .layout { display: grid; grid-template-columns: 340px 1fr 340px; gap: 14px; height: 100%; padding: 16px; box-sizing: border-box; }
        .col { display: flex; flex-direction: column; min-height: 0; gap: 12px; }
        .scroll { overflow: auto; }
        h2 { margin: 0 0 4px; font-size: 17px; }
        .sub-item {
          border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 10px 12px; margin-bottom: 8px; cursor: pointer;
        }
        .sub-item:hover { border-color: var(--accent); }
        .sub-item.sel { border-color: var(--accent); background: var(--accent-soft); }
        .sub-item .name { font-weight: 600; font-size: 13px; display: flex; justify-content: space-between; }
        .sub-item .meta { font-size: 11px; color: var(--fg-faint); margin-top: 4px; }
        .player-wrap { position: relative; }
        canvas { width: 100%; aspect-ratio: 1; background: #0f1420; border: 1px solid var(--border); border-radius: var(--radius); display:block; }
        .player-ctrl { display: flex; gap: 8px; align-items: center; margin-top: 10px; }
        .player-ctrl input[type="range"] { flex: 1; }
        .score-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
        .score-item .detail { color: var(--fg-faint); font-size: 11px; margin-top: 2px; }
        .error-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .error-tags button.on { background: var(--bad); border-color: var(--bad); color: #fff; }
        textarea { width: 100%; resize: vertical; }
        .big-score { font-size: 30px; font-weight: 700; color: var(--accent); }
        .empty-state { color: var(--fg-faint); text-align: center; padding: 60px 20px; }
      </style>
      <div class="layout">
        <div class="col">
          <h2>待复核队列</h2>
          <div class="scroll" id="queue"></div>
        </div>
        <div class="col">
          <h2 id="work-title">作品回放</h2>
          <div class="player-wrap" id="player">
            <div class="empty-state">从左侧选择一份提交作品</div>
          </div>
        </div>
        <div class="col">
          <h2>评分与错题</h2>
          <div class="scroll" id="grade-panel"></div>
        </div>
      </div>
    `;
    this.renderQueue();
  }

  disconnectedCallback(): void {
    cancelAnimationFrame(this.playRaf);
    this.renderer?.dispose?.();
  }

  private renderQueue(): void {
    const host = this.shadowRoot!.querySelector('#queue')!;
    clear(host);
    const klass = store.klasses[0];
    const subs = [...store.submissions].sort((a, b) => a.submittedAt - b.submittedAt);
    if (subs.length === 0) {
      host.appendChild(h('div', { class: 'empty-state', textContent: '暂无提交作品' }));
      return;
    }
    for (const sub of subs) {
      const student = klass?.students.find((s) => s.id === sub.studentId);
      const task = store.getTask(sub.taskId);
      const item = h('div', {
        class: `sub-item${this.selectedSubId === sub.id ? ' sel' : ''}`,
        onclick: () => this.selectSub(sub.id),
      }, [
        h('div', { class: 'name' }, [
          h('span', { textContent: student?.name ?? sub.studentId }),
          h('span', {
            class: `tag ${sub.status === 'reviewed' ? 'good' : 'warn'}`,
            textContent: sub.status === 'reviewed' ? '已复核' : '待复核',
          }),
        ]),
        h('div', { class: 'meta', textContent: `${task?.title ?? ''} · 自动 ${sub.autoScore}/${sub.autoMax}${sub.status === 'reviewed' ? ` · 教师 ${sub.teacherScore}/${sub.teacherMax}` : ''}` }),
      ]);
      host.appendChild(item);
    }
  }

  private async selectSub(subId: string): Promise<void> {
    cancelAnimationFrame(this.playRaf);
    this.selectedSubId = subId;
    const sub = store.submissions.find((s) => s.id === subId)!;
    this.project = store.getProject(sub.projectId) ?? null;
    this.renderQueue();
    this.renderPlayer(sub);
    this.renderGradePanel(sub);
  }

  private async renderPlayer(sub: Submission): Promise<void> {
    const host = this.shadowRoot!.querySelector('#player')!;
    clear(host);
    if (!this.project) {
      host.appendChild(h('div', { class: 'empty-state', textContent: '工程数据缺失' }));
      return;
    }
    this.shadowRoot!.querySelector('#work-title')!.textContent = `作品回放 · ${this.project.name}`;
    this.canvas = h('canvas') as HTMLCanvasElement;
    const range = h('input', { type: 'range', min: '0', max: String(this.project.frameCount - 1), value: '0' }) as HTMLInputElement;
    const playBtn = h('button', { class: 'primary', textContent: '▶ 播放' });
    const frameLabel = h('span', { style: 'font-family:monospace;min-width:60px', textContent: '0 / 0' });
    host.append(
      this.canvas,
      h('div', { class: 'player-ctrl' }, [playBtn, range, frameLabel]),
    );

    this.renderer = await createRenderer(this.canvas);
    this.playFrame = 0;
    const drawFrame = (frame: number): void => {
      if (!this.renderer || !this.project) return;
      const size = this.canvas.clientWidth || 520;
      this.renderer.resize(size, size, Math.min(window.devicePixelRatio || 1, 2));
      const pose = solveFK(this.project.skeleton, poseAtFrame(this.project, frame));
      let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
      for (const p of pose.ordered) {
        minX = Math.min(minX, p.start.x, p.end.x); maxX = Math.max(maxX, p.start.x, p.end.x);
        minY = Math.min(minY, p.start.y, p.end.y); maxY = Math.max(maxY, p.start.y, p.end.y);
      }
      const zoom = Math.min((size - 60) / ((maxX - minX) || 1), (size - 60) / ((maxY - minY) || 1));
      const cam = {
        x: size / 2 - ((minX + maxX) / 2) * zoom,
        y: size / 2 - ((minY + maxY) / 2) * zoom,
        zoom,
      };
      this.renderer.begin(cam, COLOR.opaque(0x0f1420));
      drawRobot(this.renderer, this.project.skeleton, pose, { showLimits: false });
      this.renderer.end();
      range.value = String(frame);
      frameLabel.textContent = `${frame} / ${this.project.frameCount - 1}`;
    };
    drawFrame(0);
    range.addEventListener('input', () => {
      cancelAnimationFrame(this.playRaf);
      playBtn.textContent = '▶ 播放';
      this.playFrame = Number(range.value);
      drawFrame(this.playFrame);
    });

    let playing = false;
    playBtn.addEventListener('click', () => {
      playing = !playing;
      playBtn.textContent = playing ? '⏸ 暂停' : '▶ 播放';
      if (!playing) {
        cancelAnimationFrame(this.playRaf);
        return;
      }
      let last = performance.now();
      const tick = (now: number): void => {
        if (!playing || !this.project) return;
        if (now - last >= 1000 / this.project.fps) {
          last = now;
          this.playFrame = (this.playFrame + 1) % this.project.frameCount;
          drawFrame(this.playFrame);
        }
        this.playRaf = requestAnimationFrame(tick);
      };
      this.playRaf = requestAnimationFrame(tick);
    });
    void sub;
  }

  private renderGradePanel(sub: Submission): void {
    const host = this.shadowRoot!.querySelector('#grade-panel')!;
    clear(host);
    const klass = store.klasses[0];
    const student = klass?.students.find((s) => s.id === sub.studentId);

    // 自动分明细
    host.appendChild(h('div', { class: 'card' }, [
      h('div', { style: 'display:flex;justify-content:space-between;align-items:center' }, [
        h('b', { textContent: '系统自动评分（60 分）' }),
        h('span', { class: 'big-score', textContent: String(sub.autoScore) }),
      ]),
      ...sub.autoItems.map((it) => h('div', { class: 'score-item' }, [
        h('div', {}, [
          h('div', { textContent: it.label }),
          h('div', { class: 'detail', textContent: it.detail }),
        ]),
        h('b', { textContent: `${it.got}/${it.max}` }),
      ])),
      h('div', { class: 'detail', style: 'margin-top:8px', textContent: sub.jumpFrames.length ? `跳变帧：第 ${sub.jumpFrames.join(', ')} 帧` : '无跳变帧' }),
    ]));

    if (store.role !== 'teacher') {
      host.appendChild(h('div', { class: 'card', style: 'margin-top:12px' }, [
        h('b', { textContent: sub.status === 'reviewed' ? '教师复核结果' : '等待教师复核' }),
        sub.status === 'reviewed'
          ? h('div', { style: 'margin-top:8px' }, [
              h('div', { textContent: `教师评分：${sub.teacherScore}/${sub.teacherMax}` }),
              h('div', { class: 'detail', style: 'margin-top:6px', textContent: `评语：${sub.teacherComment || '无'}` }),
              h('div', { class: 'detail', style: 'margin-top:6px', textContent: `错题：${sub.errors.join('、') || '无'}` }),
            ])
          : h('div', { class: 'detail', style: 'margin-top:8px', textContent: '教师复核后在此展示评语与错题（40 分）' }),
      ]));
      return;
    }

    // 教师打分表单
    const scoreInput = h('input', { type: 'range', min: '0', max: String(sub.teacherMax), value: String(sub.teacherScore ?? Math.round(sub.teacherMax * 0.8)) }) as HTMLInputElement;
    const scoreVal = h('b', { textContent: scoreInput.value });
    scoreInput.addEventListener('input', () => { scoreVal.textContent = scoreInput.value; });
    const tagHost = h('div', { class: 'error-tags' });
    const active = new Set(sub.errors);
    ERROR_TAGS.forEach((tag) => {
      const btn = h('button', {
        class: active.has(tag) ? 'on' : '',
        textContent: tag,
        onclick: () => {
          if (active.has(tag)) { active.delete(tag); btn.classList.remove('on'); }
          else { active.add(tag); btn.classList.add('on'); }
        },
      });
      tagHost.appendChild(btn);
    });
    const comment = h('textarea', { rows: 4, placeholder: '填写复核评语…' }) as HTMLTextAreaElement;
    comment.value = sub.teacherComment;

    const card = h('div', { class: 'card', style: 'margin-top:12px;display:flex;flex-direction:column;gap:10px' }, [
      h('b', { textContent: `教师复核打分（40 分） · ${student?.name ?? ''}` }),
      h('div', { style: 'display:flex;align-items:center;gap:10px' }, [scoreInput, scoreVal]),
      h('label', { textContent: '错题标注' }),
      tagHost,
      h('label', { textContent: '评语' }),
      comment,
      h('button', {
        class: 'primary',
        textContent: '提交复核结果',
        onclick: () => {
          sub.teacherScore = Number(scoreInput.value);
          sub.errors = [...active];
          sub.teacherComment = comment.value;
          sub.status = 'reviewed';
          sub.reviewedAt = Date.now();
          store.upsertSubmission(sub);
          toast(`复核完成：最终成绩 ${sub.autoScore + sub.teacherScore}/100`, 'good');
          this.renderQueue();
          this.renderGradePanel(sub);
        },
      }),
    ]);
    host.appendChild(card);
  }
}
