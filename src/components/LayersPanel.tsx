// 图层面板：锁定/可见/重命名/调序，组与复合节点的树形展示
import { For, Show, createMemo, createSignal } from 'solid-js';
import {
  docState,
  getNode,
  moveLayer,
  nodeMap,
  renameNode,
  setSelection,
  setUi,
  toggleLock,
  toggleSelection,
  toggleVisible,
  topLevelNodes,
  uiState,
} from '../store';import type { DocNode } from '../types';

const TYPE_LABEL: Record<DocNode['type'], string> = {
  shape: '形状',
  group: '组',
  compound: '布尔',
};

export default function LayersPanel() {
  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [draftName, setDraftName] = createSignal('');

  // 顶层按数组逆序：数组末尾 = 最上层
  const ordered = createMemo(() => [...topLevelNodes(docState.doc)].reverse());
  const map = createMemo(() => nodeMap(docState.doc));

  const startRename = (n: DocNode) => {
    setEditingId(n.id);
    setDraftName(n.name);
  };
  const commitRename = () => {
    const id = editingId();
    if (id && draftName().trim()) renameNode(id, draftName().trim());
    setEditingId(null);
  };

  const renderRow = (n: DocNode, depth: number) => {
    const selected = () => uiState.selection.includes(n.id);
    const childIds: string[] =
      n.type === 'group'
        ? docState.doc.nodes.filter((x) => (x as { parentId?: string }).parentId === n.id).map((x) => x.id)
        : n.type === 'compound'
          ? n.childIds
          : [];
    return (
      <div>
        <div
          class="layer-row"
          classList={{ selected: selected(), locked: n.locked }}
          style={{ 'padding-left': `${8 + depth * 16}px` }}
          onClick={(e) => {
            if (e.shiftKey) {
              toggleSelection(n.id);
            } else {
              setSelection([n.id]);
            }
            if (n.type === 'compound') setUi('compoundEditId', null);
          }}
          onDblClick={() => startRename(n)}
        >
          <span class="layer-type">{TYPE_LABEL[n.type]}</span>
          <Show
            when={editingId() === n.id}
            fallback={<span class="layer-name" title="双击重命名">{n.name}</span>}
          >
            <input
              type="text"
              value={draftName()}
              style={{ flex: 1, 'min-width': 0 }}
              onInput={(e) => setDraftName(e.currentTarget.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') setEditingId(null);
              }}
              autofocus
            />
          </Show>
          <span class="layer-actions">
            <button title="重命名" onClick={(e) => { e.stopPropagation(); startRename(n); }}>✎</button>
            <button
              title={n.visible ? '隐藏' : '显示'}
              onClick={(e) => { e.stopPropagation(); toggleVisible(n.id); }}
            >
              {n.visible ? '👁' : '—'}
            </button>
            <button
              title={n.locked ? '解锁' : '锁定'}
              onClick={(e) => { e.stopPropagation(); toggleLock(n.id); }}
            >
              {n.locked ? '🔒' : '🔓'}
            </button>
            <button title="上移一层" onClick={(e) => { e.stopPropagation(); moveLayer(n.id, 'up'); }}>↑</button>
            <button title="下移一层" onClick={(e) => { e.stopPropagation(); moveLayer(n.id, 'down'); }}>↓</button>
          </span>
        </div>
        <For each={childIds}>
          {(cid) => {
            const child = getNode(docState.doc, cid);
            return child ? renderRow(child, depth + 1) : null;
          }}
        </For>
      </div>
    );
  };

  return (
    <div class="layers-panel">
      <div class="panel-header">
        图层
        <span class="hint">{docState.doc.nodes.length} 个节点</span>
      </div>
      <div class="panel-body">
        <Show when={ordered().length} fallback={<div class="hint">画布为空，从工具栏添加海星/水母/浪花。</div>}>
          <For each={ordered()}>{(n) => renderRow(n, 0)}</For>
        </Show>
        <div style={{ height: '8px' }} />
        <div class="hint">
          提示：双击图层名重命名；锁定后不可选中或拖动；↑↓ 调整叠放顺序。
        </div>
        <Show when={map().size > 0}>
          <div class="hint" style={{ margin: '8px 0' }}>
            文件名：{docState.fileName}{docState.dirty ? '（未保存）' : ''}
          </div>
        </Show>
      </div>
    </div>
  );
}
