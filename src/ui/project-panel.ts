/** 订单项目面板：客户下单建项目 → 制作员分条目制作 → 主管审核/退回 → 打包交付 */

import {
  ItemKind,
  KIND_LABELS,
  OrderItem,
  Project,
  ROLE_LABELS,
  Role,
  STATUS_LABELS,
  store,
} from '../state/store';
import { PANEL_CSS } from './common';

interface DraftEntry {
  kind: ItemKind;
  name: string;
  deadline: string;
}

export class ProjectPanel extends HTMLElement {
  private unsub?: () => void;
  private draft: DraftEntry[] = [];

  connectedCallback(): void {
    this.attachShadow({ mode: 'open' });
    this.unsub = store.subscribe(() => this.render());
    this.render();
  }

  disconnectedCallback(): void {
    this.unsub?.();
  }

  private defaultDeadline(): string {
    const d = new Date(Date.now() + 14 * 86400_000);
    return d.toISOString().slice(0, 10);
  }

  private render(): void {
    const s = store.state;
    const shadow = this.shadowRoot!;
    shadow.innerHTML = `
      <style>${PANEL_CSS}
        .role { margin-bottom: 8px; }
        .proj { border: 1px solid #3c4148; border-radius: 6px; padding: 8px; margin-bottom: 8px; }
        .proj h4 { margin: 0 0 6px; font-size: 13px; color: #e6e2d8; }
        .item { border-top: 1px dashed #3c4148; padding: 6px 0; }
        .badge { display: inline-block; padding: 1px 8px; border-radius: 8px; font-size: 11px; margin-right: 6px; }
        .st-pending { background: #4a4f58; } .st-making { background: #6b5a2e; }
        .st-review { background: #2e5a6b; } .st-approved { background: #3c6b2e; }
        .st-delivered { background: #555; text-decoration: line-through; }
        .rework { color: #e08a8a; font-size: 11px; }
        .hist { color: #8b8578; font-size: 11px; margin-top: 4px; }
        .hist div { margin-top: 2px; }
        .deadline { color: #d8c98f; font-size: 11px; }
        .overdue { color: #e08a8a; }
        .entry { display: flex; gap: 4px; margin-bottom: 4px; align-items: center; }
        .entry input { max-width: 90px; }
      </style>
      <h3>订单项目（当前身份：${ROLE_LABELS[s.role]}）</h3>
      <div class="row role">
        <button id="roleMaker" class="${s.role === 'maker' ? 'active' : ''}">制作员</button>
        <button id="roleSupervisor" class="${s.role === 'supervisor' ? 'active' : ''}">主管</button>
      </div>
      <fieldset style="border:1px solid #3c4148;border-radius:6px;margin:0 0 10px;padding:8px">
        <legend>新建订单（纹样取当前画布参数快照）</legend>
        <div class="row"><label>客户</label><input id="customer" placeholder="客户名称"></div>
        <div id="entries"></div>
        <div class="row">
          <button id="addHead">+ 床头面条目</button>
          <button id="addSeat">+ 椅面条目</button>
          <button id="create" class="primary">建项目</button>
        </div>
      </fieldset>
      <div id="projects"></div>
    `;

    (shadow.querySelector('#roleMaker') as HTMLButtonElement).addEventListener('click', () =>
      store.set({ role: 'maker' }),
    );
    (shadow.querySelector('#roleSupervisor') as HTMLButtonElement).addEventListener('click', () =>
      store.set({ role: 'supervisor' }),
    );

    // --- 建单草稿 ---
    const entriesBox = shadow.querySelector('#entries') as HTMLDivElement;
    const renderDraft = () => {
      entriesBox.innerHTML = '';
      this.draft.forEach((e, idx) => {
        const row = document.createElement('div');
        row.className = 'entry';
        row.innerHTML = `<span class="badge st-review">${KIND_LABELS[e.kind]}</span>`;
        const name = document.createElement('input');
        name.value = e.name;
        name.placeholder = '条目名称';
        name.addEventListener('change', () => (e.name = name.value));
        const dl = document.createElement('input');
        dl.type = 'date';
        dl.value = e.deadline;
        dl.addEventListener('change', () => (e.deadline = dl.value));
        const del = document.createElement('button');
        del.textContent = '×';
        del.className = 'danger';
        del.addEventListener('click', () => {
          this.draft.splice(idx, 1);
          this.render();
        });
        row.append(name, dl, del);
        entriesBox.append(row);
      });
    };
    renderDraft();

    (shadow.querySelector('#addHead') as HTMLButtonElement).addEventListener('click', () => {
      this.draft.push({ kind: 'headboard', name: `床头面 ${this.draft.length + 1}`, deadline: this.defaultDeadline() });
      this.render();
    });
    (shadow.querySelector('#addSeat') as HTMLButtonElement).addEventListener('click', () => {
      this.draft.push({ kind: 'seat', name: `椅面 ${this.draft.length + 1}`, deadline: this.defaultDeadline() });
      this.render();
    });
    (shadow.querySelector('#create') as HTMLButtonElement).addEventListener('click', () => {
      const customer = (shadow.querySelector('#customer') as HTMLInputElement).value.trim();
      if (!customer || this.draft.length === 0) return;
      store.createProject(customer, this.draft.map((e) => ({ ...e })));
      this.draft = [];
    });

    // --- 项目列表 ---
    const box = shadow.querySelector('#projects') as HTMLDivElement;
    for (const p of s.projects) {
      box.append(this.renderProject(p, s.role));
    }
    if (s.projects.length === 0) {
      box.innerHTML = '<div class="hint">暂无订单项目</div>';
    }
  }

  private renderProject(p: Project, role: Role): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'proj';
    const allApproved = p.items.every((it) => it.status === 'approved');
    const head = document.createElement('h4');
    head.textContent = `${p.customer} · ${p.id}${p.deliveredAt ? `（已于 ${p.deliveredAt} 交付）` : ''}`;
    wrap.append(head);

    for (const it of p.items) {
      wrap.append(this.renderItem(it, role));
    }

    const row = document.createElement('div');
    row.className = 'row';
    row.style.marginTop = '6px';
    if (!p.deliveredAt) {
      const deliver = document.createElement('button');
      deliver.className = 'primary';
      deliver.textContent = '打包交付';
      deliver.disabled = !allApproved;
      deliver.title = allApproved ? '全部条目已通过，可交付' : '须全部条目审核通过';
      deliver.addEventListener('click', () => store.deliverProject(p.id));
      row.append(deliver);
      const del = document.createElement('button');
      del.className = 'danger';
      del.textContent = '删除项目';
      del.addEventListener('click', () => store.deleteProject(p.id));
      row.append(del);
    } else {
      const info = document.createElement('span');
      info.className = 'deadline';
      info.textContent = `交付包：${p.items.map((it) => `${it.name}(截止 ${it.deadline})`).join('、')}`;
      row.append(info);
    }
    wrap.append(row);
    return wrap;
  }

  private renderItem(it: OrderItem, role: Role): HTMLElement {
    const div = document.createElement('div');
    div.className = 'item';
    const overdue = !['approved', 'delivered'].includes(it.status) && it.deadline < new Date().toISOString().slice(0, 10);
    div.innerHTML = `
      <span class="badge st-${it.status}">${STATUS_LABELS[it.status]}</span>
      <b>${KIND_LABELS[it.kind]}</b> ${it.name}
      <span class="deadline ${overdue ? 'overdue' : ''}">截止 ${it.deadline}${overdue ? '（已超期）' : ''}</span>
      ${it.rework > 0 ? `<span class="rework">返工 ${it.rework} 次</span>` : ''}
      <span class="hint">种子 ${it.params.seed} · ${it.params.rule}</span>
    `;

    const btns = document.createElement('div');
    btns.className = 'row';
    btns.style.marginTop = '4px';
    const mk = (label: string, fn: () => void, primary = false) => {
      const b = document.createElement('button');
      b.textContent = label;
      if (primary) b.className = 'primary';
      b.addEventListener('click', fn);
      btns.append(b);
    };
    if (role === 'maker') {
      if (it.status === 'pending') mk('开始制作', () => store.makerStart(it.id), true);
      if (it.status === 'making') mk('提交审核', () => store.makerSubmit(it.id), true);
    } else {
      if (it.status === 'review') {
        mk('通过', () => store.supervisorApprove(it.id), true);
        mk('退回重做', () => {
          store.supervisorReject(it.id, '主管退回');
        });
      }
    }
    div.append(btns);

    if (it.history.length > 0) {
      const hist = document.createElement('div');
      hist.className = 'hist';
      hist.innerHTML = it.history
        .map((h) => `<div>${h.time} · ${h.actor} · ${h.action}${h.note ? ` · ${h.note}` : ''}</div>`)
        .join('');
      div.append(hist);
    }
    return div;
  }
}

customElements.define('project-panel', ProjectPanel);
