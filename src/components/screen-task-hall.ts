import type { Task } from '../core/types.js';
import { store } from '../core/store.js';
import { h, clear, SHARED_CSS, toast } from './dom.js';
import { uid } from '../core/math.js';

export class ScreenTaskHall extends HTMLElement {
  connectedCallback(): void {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = /* html */ `
      <style>
        ${SHARED_CSS}
        :host { display: block; height: 100%; overflow: auto; }
        .wrap { max-width: 1080px; margin: 0 auto; padding: 24px; }
        .page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        h2 { margin: 0; font-size: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
        .task-card { display: flex; flex-direction: column; gap: 10px; }
        .task-card h3 { margin: 0; font-size: 16px; }
        .desc { color: var(--fg-dim); font-size: 13px; line-height: 1.6; flex: 1; }
        .meta { display: flex; flex-wrap: wrap; gap: 6px; }
        .card-actions { display: flex; gap: 8px; align-items: center; }
        .teacher-form { margin-top: 20px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-grid .full { grid-column: 1 / -1; }
        .form-grid label { display: flex; flex-direction: column; gap: 4px; }
        .student-name { color: var(--accent); font-weight: 600; }
        .score-line { font-size: 12px; color: var(--fg-dim); }
      </style>
      <div class="wrap">
        <div class="page-head">
          <h2 id="head-title"></h2>
          <span id="head-actions"></span>
        </div>
        <div class="grid" id="grid"></div>
        <div id="teacher-zone"></div>
      </div>
    `;

    const isTeacher = store.role === 'teacher';
    root.querySelector('#head-title')!.textContent = isTeacher ? '📋 任务管理（教师）' : '📋 任务大厅';
    if (!isTeacher) {
      const select = h('select', {
        onchange: (e: Event) => {
          store.currentStudentId = (e.target as HTMLSelectElement).value;
          store.save();
          this.render();
        },
      }, (store.klasses[0]?.students ?? []).map((s) =>
        h('option', { value: s.id, textContent: `当前学员：${s.name}`, selected: s.id === store.currentStudentId })));
      root.querySelector('#head-actions')!.appendChild(select);
    } else {
      root.querySelector('#head-actions')!.appendChild(
        h('button', { class: 'primary', textContent: '＋ 布置新任务', onclick: () => this.toggleForm() }),
      );
    }

    this.render();
    if (isTeacher) this.renderTeacherForm(false);
  }

  private render(): void {
    const grid = this.shadowRoot!.querySelector('#grid')!;
    clear(grid);
    const isTeacher = store.role === 'teacher';

    for (const task of store.tasks) {
      const project = store.projectForStudentTask(store.currentStudentId, task.id);
      const sub = project ? store.submissionOfProject(project.id) : undefined;
      const card = h('div', { class: 'card task-card' }, [
        h('h3', { textContent: task.title }),
        h('div', { class: 'desc', textContent: task.desc }),
        h('div', { class: 'meta' }, [
          h('span', { class: 'tag', textContent: `≥${task.rubric.minKeyframes} 关键帧` }),
          h('span', { class: 'tag', textContent: `摆幅 ${task.rubric.angleRangeDeg}°` }),
          h('span', { class: 'tag', textContent: `${task.rubric.durationSec}s` }),
          h('span', { class: 'tag', textContent: `截止 ${task.deadline}` }),
        ]),
      ]);

      const actions = h('div', { class: 'card-actions' });
      if (isTeacher) {
        actions.appendChild(h('span', { class: 'score-line', textContent: `已提交 ${store.submissions.filter((s) => s.taskId === task.id).length} 份` }));
        actions.appendChild(h('button', {
          textContent: '查看提交 →',
          onclick: () => { location.hash = '#/review'; },
        }));
      } else if (sub) {
        const score = sub.status === 'reviewed' && sub.teacherScore !== null
          ? sub.autoScore + sub.teacherScore
          : sub.autoScore;
        actions.appendChild(h('span', {
          class: `tag ${sub.status === 'reviewed' ? 'good' : 'warn'}`,
          textContent: sub.status === 'reviewed' ? `已复核 · ${score}/100` : `已提交 · 自动 ${score}/60`,
        }));
        actions.appendChild(h('button', { textContent: '查看作品', onclick: () => { location.hash = `#/editor/${task.id}`; } }));
        if (sub.status === 'reviewed') {
          actions.appendChild(h('button', {
            class: 'ghost',
            textContent: '查看评语',
            onclick: () => toast(sub.teacherComment || '教师未填写评语', 'info'),
          }));
        }
      } else if (project) {
        actions.appendChild(h('span', { class: 'tag warn', textContent: '草稿未提交' }));
        actions.appendChild(h('button', { class: 'primary', textContent: '继续编辑 →', onclick: () => { location.hash = `#/editor/${task.id}`; } }));
      } else {
        actions.appendChild(h('button', { class: 'primary', textContent: '开始制作 →', onclick: () => { location.hash = `#/editor/${task.id}`; } }));
      }
      card.appendChild(actions);
      grid.appendChild(card);
    }

    if (!isTeacher) {
      const me = store.klasses[0]?.students.find((s) => s.id === store.currentStudentId);
      if (me) {
        const title = this.shadowRoot!.querySelector('#head-title')!;
        title.textContent = `📋 任务大厅 · ${me.name}`;
      }
    }
  }

  private toggleForm(): void {
    const zone = this.shadowRoot!.querySelector('#teacher-zone')!;
    if (zone.firstChild) clear(zone);
    else this.renderTeacherForm(true);
  }

  private field(label: string, input: HTMLElement, extraClass = ''): HTMLLabelElement {
    const el = h('label', extraClass ? { class: extraClass } : {});
    el.append(document.createTextNode(label), input);
    return el;
  }

  private renderTeacherForm(show: boolean): void {
    const zone = this.shadowRoot!.querySelector('#teacher-zone')!;
    clear(zone);
    if (!show) return;
    const form = h('div', { class: 'card teacher-form' });
    form.appendChild(h('h3', { textContent: '布置新动画任务' }));
    const titleIn = h('input', { type: 'text', placeholder: '任务标题，如：机器人鞠躬问好' });
    const descIn = h('textarea', { rows: 3, placeholder: '任务描述与动作要求' });
    const minKf = h('input', { type: 'number', value: '10' });
    const range = h('input', { type: 'number', value: '60' });
    const dur = h('input', { type: 'number', value: '5' });
    const tol = h('input', { type: 'number', value: '14' });
    const deadline = h('input', { type: 'date', value: '2026-12-31' });
    form.appendChild(h('div', { class: 'form-grid' }, [
      this.field('标题', titleIn, 'full'),
      this.field('描述', descIn, 'full'),
      this.field('最少关键帧数', minKf),
      this.field('角度范围要求（°）', range),
      this.field('目标时长（秒）', dur),
      this.field('跳变阈值（°/帧）', tol),
      this.field('截止日期', deadline, 'full'),
    ]));
    form.appendChild(h('div', { style: 'margin-top:14px;display:flex;gap:8px' }, [
      h('button', {
        class: 'primary',
        textContent: '发布任务',
        onclick: () => {
          if (!titleIn.value) {
            toast('请填写任务标题', 'bad');
            return;
          }
          const task: Task = {
            id: uid('task'),
            title: titleIn.value,
            desc: descIn.value || '（无描述）',
            rubric: {
              minKeyframes: Number(minKf.value) || 10,
              angleRangeDeg: Number(range.value) || 60,
              durationSec: Number(dur.value) || 5,
              jumpTolerance: Number(tol.value) || 14,
            },
            deadline: deadline.value,
            createdAt: Date.now(),
          };
          store.upsertTask(task);
          toast('任务已发布，学员端可见', 'good');
          this.renderTeacherForm(false);
          this.render();
        },
      }),
      h('button', { textContent: '取消', onclick: () => this.renderTeacherForm(false) }),
    ]));
    zone.appendChild(form);
  }
}
