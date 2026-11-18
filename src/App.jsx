// 应用外壳：三端导航 + 当前订单选择
import { For, Show, createSignal } from 'solid-js';
import { store } from './domain/store.js';
import Dispatcher from './components/Dispatcher.jsx';
import MasterWorkspace from './components/MasterWorkspace.jsx';
import QCStation from './components/QCStation.jsx';
import Dashboard from './components/Dashboard.jsx';

const TABS = [
  { key: 'dispatch', label: '前台派单', role: 'dispatcher' },
  { key: 'master', label: '师傅工作台', role: 'master' },
  { key: 'qc', label: '质检台', role: 'qc' },
  { key: 'dashboard', label: '生产看板', role: 'manager' },
];

export default function App() {
  const [tab, setTab] = createSignal('dispatch');
  const current = () => store.currentOrder();

  const go = (key) => {
    setTab(key);
    const t = TABS.find((x) => x.key === key);
    store.setRole(t.role);
  };

  return (
    <div>
      <header class="topbar">
        <div class="brand">琉璃照壁过程式生成工作台<small>瓦件规格驱动 · 种子纹样可复现</small></div>
        <nav class="nav">
          <For each={TABS}>
            {(t) => <button classList={{ active: tab() === t.key }} onClick={() => go(t.key)}>{t.label}</button>}
          </For>
        </nav>
        <div class="spacer" />
        <Show when={store.state.orders.length}>
          <select value={store.state.currentOrderId ?? ''}
            onChange={(e) => store.setCurrentOrder(e.currentTarget.value || null)}>
            <option value="">— 选择订单 —</option>
            <For each={store.state.orders}>
              {(o) => <option value={o.id}>{o.id} · {o.master ?? '未分派'} · {o.width}×{o.height}</option>}
            </For>
          </select>
        </Show>
      </header>

      <main class="page">
        <Show when={tab() === 'dispatch'}>
          <Dispatcher onCreated={() => go('master')} />
        </Show>
        <Show when={tab() === 'master'}>
          <MasterWorkspace />
        </Show>
        <Show when={tab() === 'qc'}>
          <QCStation />
        </Show>
        <Show when={tab() === 'dashboard'}>
          <Dashboard />
        </Show>
      </main>

      <Show when={current() && tab() === 'master'}>
        <div style={{ position: 'fixed', right: 16, bottom: 14, 'z-index': 5 }}>
          <button class="btn sm" onClick={() => {
            if (confirm('清空本机全部订单数据？此操作不可恢复。')) store.resetAll();
          }}>清空演示数据</button>
        </div>
      </Show>
    </div>
  );
}
