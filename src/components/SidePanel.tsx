// 右侧面板标签容器
import { createSignal } from 'solid-js';
import PropertiesPanel from './PropertiesPanel';
import AnnotationsPanel from './AnnotationsPanel';
import VersionsPanel from './VersionsPanel';

type Tab = 'props' | 'anno' | 'versions';

export default function SidePanel() {
  const [tab, setTab] = createSignal<Tab>('props');
  const tabs: { id: Tab; label: string }[] = [
    { id: 'props', label: '属性' },
    { id: 'anno', label: '批注' },
    { id: 'versions', label: '版本' },
  ];
  return (
    <div class="side-panel">
      <div class="tabs">
        {tabs.map((t) => (
          <button classList={{ active: tab() === t.id }} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div class="panel-body">
        {tab() === 'props' && <PropertiesPanel />}
        {tab() === 'anno' && <AnnotationsPanel />}
        {tab() === 'versions' && <VersionsPanel />}
      </div>
    </div>
  );
}
