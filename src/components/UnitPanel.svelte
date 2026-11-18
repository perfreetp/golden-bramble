<script lang="ts">
  import { fieldStore, selectedUnitId, toggleLock, rotateUnit, updateUnit, removeUnit, addUnit } from '../lib/stores';
  import { UNIT_LABELS, ALL_UNIT_TYPES, type ObstacleUnit } from '../lib/types';
  import { unitIncline, unitObstacleHeight, unitChannelWidth } from '../lib/evaluation';

  let edit: ObstacleUnit | null = null;

  $: {
    const u = $fieldStore.units.find((x) => x.id === $selectedUnitId) ?? null;
    // 保留面板正在编辑的草稿，仅在选中对象切换时重置
    if (!u || !edit || u.id !== edit.id) edit = u ? structuredClone(u) : null;
    else if (u !== edit) {
      // 外部（Gizmo）改动同步位置/旋转/尺寸，不清空输入焦点值
      edit.position = u.position;
      edit.rotation = u.rotation;
      edit.size = u.size;
      edit.locked = u.locked;
    }
  }

  function save() {
    if (!edit) return;
    updateUnit(edit);
  }

  function patchSize(field: 'w' | 'd' | 'h', v: number) {
    if (!edit) return;
    edit.size = { ...edit.size, [field]: Math.max(50, v || 50) };
  }
</script>

<div class="panel">
  <h3>单元列表（{$fieldStore.units.length}）</h3>
  <div class="unit-list scroll">
    {#each $fieldStore.units as u (u.id)}
      <div
        class="unit-row"
        class:selected={u.id === $selectedUnitId}
        role="button"
        on:click={() => selectedUnitId.set(u.id)}
        on:keydown={(e) => e.key === 'Enter' && selectedUnitId.set(u.id)}
      >
        <span class="dot type-{u.type}"></span>
        <span class="u-name">{UNIT_LABELS[u.type]}</span>
        <span class="muted">{u.id}</span>
        {#if u.locked}<span class="tag locked">锁定</span>{/if}
      </div>
    {/each}
  </div>
  <div class="quick-add">
    {#each ALL_UNIT_TYPES as t}
      <button on:click={() => addUnit(t)}>+{UNIT_LABELS[t]}</button>
    {/each}
  </div>

  {#if edit}
    <h3>单元编辑 — {UNIT_LABELS[edit.type]} {edit.id}</h3>
    <div class="row">
      <div class="field">
        <label>中心 X (mm)</label>
        <input
          type="number"
          bind:value={edit.position.x}
          disabled={edit.locked}
          on:change={save}
        />
      </div>
      <div class="field">
        <label>中心 Z (mm)</label>
        <input
          type="number"
          bind:value={edit.position.z}
          disabled={edit.locked}
          on:change={save}
        />
      </div>
    </div>
    <div class="field">
      <label>旋转角 (°)</label>
      <div class="rot-row">
        <input type="number" bind:value={edit.rotation} disabled={edit.locked} on:change={save} />
        <button disabled={edit.locked} on:click={() => edit && rotateUnit(edit.id, 15)}>+15°</button>
        <button disabled={edit.locked} on:click={() => edit && rotateUnit(edit.id, -15)}>-15°</button>
      </div>
    </div>
    <div class="row">
      <div class="field">
        <label>宽 W (mm)</label>
        <input
          type="number"
          value={edit.size.w}
          disabled={edit.locked}
          on:change={(e) => { patchSize('w', +e.currentTarget.value); save(); }}
        />
      </div>
      <div class="field">
        <label>深 D (mm)</label>
        <input
          type="number"
          value={edit.size.d}
          disabled={edit.locked}
          on:change={(e) => { patchSize('d', +e.currentTarget.value); save(); }}
        />
      </div>
      <div class="field">
        <label>高 H (mm)</label>
        <input
          type="number"
          value={edit.size.h}
          disabled={edit.locked}
          on:change={(e) => { patchSize('h', +e.currentTarget.value); save(); }}
        />
      </div>
    </div>

    <div class="metrics">
      <div>坡度 <b>{unitIncline(edit)}°</b></div>
      <div>障碍高 <b>{unitObstacleHeight(edit)}mm</b></div>
      <div>通道宽 <b>{unitChannelWidth(edit)}mm</b></div>
    </div>

    <div class="lock-row">
      <button class={edit.locked ? 'warn' : 'primary'} on:click={() => edit && toggleLock(edit.id)}>
        {edit.locked ? '解锁（重新生成时将重排）' : '锁定（重新生成时保持不动）'}
      </button>
      <button class="danger" disabled={edit.locked} on:click={() => edit && removeUnit(edit.id)}>删除</button>
    </div>
    {#if edit.locked}
      <p class="muted small">该单元已锁定：位置、旋转、尺寸均不可编辑，重新生成时原样保留。</p>
    {/if}
  {:else}
    <p class="muted small">在 3D 视图或上方列表中点选一个单元进行编辑。</p>
  {/if}
</div>

<style>
  .panel {
    padding: 12px;
  }
  .unit-list {
    max-height: 230px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .unit-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--panel-2);
    cursor: pointer;
  }
  .unit-row.selected {
    border-color: var(--accent);
    background: #243150;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  .type-steps { background: #7389bf; }
  .type-ramp { background: #66b373; }
  .type-posts { background: #b373a6; }
  .type-bridge { background: #8c80bf; }
  .type-gravel { background: #998c73; }
  .u-name {
    flex: 1;
  }
  .quick-add {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin: 8px 0;
  }
  .quick-add button {
    flex: 1 1 30%;
    padding: 4px 6px;
    font-size: 12px;
  }
  .rot-row {
    display: flex;
    gap: 6px;
  }
  .metrics {
    display: flex;
    justify-content: space-between;
    background: var(--panel-2);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px;
    margin-bottom: 10px;
    font-size: 12px;
  }
  .metrics b {
    color: var(--accent-2);
  }
  .lock-row {
    display: flex;
    gap: 8px;
  }
  .lock-row button {
    flex: 1;
  }
  .small {
    font-size: 12px;
  }
</style>
