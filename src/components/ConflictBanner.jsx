// 冲突裁决条：列出未解决冲突，让师傅选保留旧件还是采用新排布
import { For, Show } from 'solid-js';
import { store } from '../domain/store.js';

export default function ConflictBanner(props) {
  const order = () => store.currentOrder();
  const conflicts = () => order()?.facade?.conflicts ?? [];
  const open = () => conflicts().filter((c) => !c.resolution);

  return (
    <Show when={open().length}>
      <div class="conflict-banner">
        <h2>⚠ 新排布与保留构件存在 {open().length} 处冲突，请逐处裁决</h2>
        <p class="hint" style={{ margin: '0 0 10px' }}>
          锁定/手改过的构件已按位置锚点留在原位，与新排布里重叠的构件互斥，二选一。
        </p>
        <For each={conflicts()}>
          {(cf) => (
            <div class={`conflict-item ${cf.resolution ? 'resolved' : ''}`}>
              <strong>{cf.oldId}</strong>
              <span class="muted">↔</span>
              <strong>{cf.newId}</strong>
              <span class="muted">（{cf.zoneKey} 区域重叠）</span>
              <Show when={cf.resolution} fallback={
                <div class="btn-row" style={{ 'margin-left': 'auto' }}>
                  <button class="btn sm safe"
                    onClick={() => store.decideConflict(order().id, cf.id, 'old')}>
                    保留旧件
                  </button>
                  <button class="btn sm danger"
                    onClick={() => store.decideConflict(order().id, cf.id, 'new')}>
                    采用新排布
                  </button>
                </div>
              }>
                <span class={`badge ${cf.resolution === 'old' ? 'passed' : 'returned'}`}
                  style={{ 'margin-left': 'auto' }}>
                  已裁决：{cf.resolution === 'old' ? '保留旧件' : '采用新排布'}
                </span>
              </Show>
            </div>
          )}
        </For>
      </div>
    </Show>
  );
}
