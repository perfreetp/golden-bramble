import { store } from '../core/store.js';
import { buildSeedBundle } from '../core/seed.js';
import { h, clear, SHARED_CSS, type ToastMsg } from './dom.js';
import type { Role } from '../core/types.js';

const ROUTES = [
  { hash: '#/tasks', label: '任务大厅', icon: '📋' },
  { hash: '#/editor', label: '动画编辑器', icon: '🎬' },
  { hash: '#/review', label: '考核评分', icon: '✅' },
  { hash: '#/dashboard', label: '班级汇总', icon: '📊' },
];

export class AppShell extends HTMLElement {
  private viewHost!: HTMLDivElement;
  private toastHost!: HTMLDivElement;
  private unsubscribe: (() => void) | null = null;

  connectedCallback(): void {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = /* html */ `
      <style>
        ${SHARED_CSS}
        :host { display: flex; flex-direction: column; height: 100vh; }
        .topbar {
          display: flex; align-items: center; gap: 18px;
          padding: 0 18px; height: 52px;
          background: var(--bg-panel);
          border-bottom: 1px solid var(--border);
          flex: none;
        }
        .brand { font-weight: 700; font-size: 15px; white-space: nowrap; display:flex; align-items:center; gap:8px; }
        .brand .logo { font-size: 18px; }
        nav { display: flex; gap: 4px; flex: 1; }
        nav a {
          color: var(--fg-dim); text-decoration: none;
          padding: 7px 12px; border-radius: var(--radius-sm);
          font-size: 13px; display:flex; align-items:center; gap:6px;
        }
        nav a:hover { background: var(--bg-panel-2); color: var(--fg); }
        nav a.active { color: var(--accent); background: var(--accent-soft); }
        .spacer { flex: 1; }
        .role-switch { display: flex; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); overflow: hidden; }
        .role-switch button { border: none; border-radius: 0; padding: 6px 14px; }
        .role-switch button.on { background: var(--accent); color: #fff; }
        .view { flex: 1; min-height: 0; position: relative; }
        .toasts {
          position: fixed; right: 18px; bottom: 18px;
          display: flex; flex-direction: column; gap: 8px; z-index: 999;
        }
        .toast {
          padding: 10px 14px; border-radius: var(--radius-sm);
          background: var(--bg-panel-2); border: 1px solid var(--border-strong);
          box-shadow: var(--shadow); font-size: 13px;
          animation: slide-in .2s ease-out;
          max-width: 360px;
        }
        .toast.good { border-color: var(--good); }
        .toast.warn { border-color: var(--warn); }
        .toast.bad { border-color: var(--bad); }
        @keyframes slide-in { from { transform: translateY(8px); opacity: 0; } }
      </style>
      <div class="topbar">
        <div class="brand"><span class="logo">🤖</span>机器人舞蹈动画考核平台</div>
        <nav></nav>
        <div class="role-switch">
          <button data-role="student">学员</button>
          <button data-role="teacher">教师</button>
        </div>
        <button class="ghost" id="reseed" title="恢复演示数据">重置演示</button>
      </div>
      <div class="view" id="view-host"></div>
      <div class="toasts" id="toast-host"></div>
    `;

    const nav = root.querySelector('nav')!;
    nav.append(...ROUTES.map((r) => h('a', { href: r.hash, textContent: `${r.icon} ${r.label}` })));

    this.viewHost = root.querySelector('#view-host')!;
    this.toastHost = root.querySelector('#toast-host')!;

    root.querySelectorAll<HTMLButtonElement>('.role-switch button').forEach((btn) => {
      btn.addEventListener('click', () => store.setRole(btn.dataset.role as Role));
    });
    root.querySelector('#reseed')!.addEventListener('click', () => {
      store.reseed(buildSeedBundle());
      location.hash = '#/tasks';
      this.route();
    });

    window.addEventListener('hashchange', this.route);
    window.addEventListener('app-toast', this.onToast as EventListener);
    this.unsubscribe = store.subscribe(() => this.syncRole());
    this.syncRole();
    if (!location.hash) location.hash = '#/tasks';
    this.route();
  }

  disconnectedCallback(): void {
    window.removeEventListener('hashchange', this.route);
    window.removeEventListener('app-toast', this.onToast as EventListener);
    this.unsubscribe?.();
  }

  private lastRole = store.role;

  private syncRole = (): void => {
    const root = this.shadowRoot!;
    root.querySelectorAll<HTMLButtonElement>('.role-switch button').forEach((btn) => {
      btn.classList.toggle('on', btn.dataset.role === store.role);
    });
    // 角色切换后重建当前屏幕，让教师/学员视图立即生效
    if (this.lastRole !== store.role) {
      this.lastRole = store.role;
      this.route();
    }
  };

  private route = (): void => {
    const hash = location.hash || '#/tasks';
    const root = this.shadowRoot!;
    root.querySelectorAll('nav a').forEach((a) => {
      const el = a as HTMLAnchorElement;
      el.classList.toggle('active', hash.startsWith(el.hash) || (el.hash === '#/editor' && hash.startsWith('#/editor')));
    });
    clear(this.viewHost);
    let tag: string;
    if (hash.startsWith('#/editor')) tag = 'screen-anim-editor';
    else if (hash.startsWith('#/review')) tag = 'screen-grade-review';
    else if (hash.startsWith('#/dashboard')) tag = 'screen-class-dashboard';
    else tag = 'screen-task-hall';
    this.viewHost.appendChild(document.createElement(tag));
  };

  private onToast = (e: CustomEvent<ToastMsg>): void => {
    const el = h('div', { class: `toast ${e.detail.kind}`, textContent: e.detail.text });
    this.toastHost.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity .3s';
      setTimeout(() => el.remove(), 320);
    }, 2600);
  };
}
