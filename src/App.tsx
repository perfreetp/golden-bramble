// 应用外壳：角色切换 + 四界面导航
import { Match, Switch } from 'solid-js';
import { actions, store, type ViewKey } from './store';
import type { Role } from './types';
import Intake from './views/Intake';
import Workbench from './views/Workbench';
import QC from './views/QC';
import Dashboard from './views/Dashboard';

const NAV: Array<{ key: ViewKey; label: string; icon: string }> = [
  { key: 'intake', label: '前台接单', icon: '📋' },
  { key: 'workbench', label: '设计工作台', icon: '🧴' },
  { key: 'qc', label: '质检抽查', icon: '🔍' },
  { key: 'dashboard', label: '生产看板', icon: '📊' },
];

const ROLES: Array<{ key: Role; label: string }> = [
  { key: 'frontdesk', label: '前台' },
  { key: 'designer', label: '设计师' },
  { key: 'qc', label: '质检' },
  { key: 'manager', label: '主管' },
];

export default function App() {
  return (
    <div class="app">
      <header class="app-header">
        <div class="brand">
          <span class="brand-mark">瓶</span>
          <div>
            <div class="brand-title">瓶型曲面建模与标签展开工作台</div>
            <div class="brand-sub">日化包装瓶厂 · 样条轮廓 → 旋转曲面 → 等距偏移 → 柱面展开</div>
          </div>
        </div>
        <nav class="main-nav">
          {NAV.map((n) => (
            <button
              class={`nav-btn ${store.view === n.key ? 'active' : ''}`}
              onClick={() => actions.setView(n.key)}
            >
              <span class="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div class="role-switch">
          <span class="role-label">当前角色</span>
          <select value={store.role} onChange={(e) => actions.setRole(e.currentTarget.value as Role)}>
            {ROLES.map((r) => (
              <option value={r.key}>{r.label}</option>
            ))}
          </select>
        </div>
      </header>

      <main class="app-main">
        <Switch>
          <Match when={store.view === 'intake'}><Intake /></Match>
          <Match when={store.view === 'workbench'}><Workbench /></Match>
          <Match when={store.view === 'qc'}><QC /></Match>
          <Match when={store.view === 'dashboard'}><Dashboard /></Match>
        </Switch>
      </main>
    </div>
  );
}
