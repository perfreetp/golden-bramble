<script lang="ts">
  import { fieldStore, generateNew, regenerate } from '../lib/stores';
  import { ALL_UNIT_TYPES, UNIT_LABELS, type FieldConfig, type UnitType } from '../lib/types';

  let draft: FieldConfig = structuredClone($fieldStore.config);
  let seqDraft: UnitType[] = [...$fieldStore.config.sequence];
  let message = '';

  // 切换场地后同步草稿
  fieldStore.subscribe((f) => {
    draft = structuredClone(f.config);
    seqDraft = [...f.config.sequence];
  });

  const merged = (): FieldConfig => ({ ...draft, sequence: [...seqDraft] });

  function doGenerate() {
    if (seqDraft.length === 0) {
      message = '障碍序列不能为空';
      return;
    }
    generateNew(merged());
    message = `已按种子 ${draft.seed} 生成 ${seqDraft.length} 个单元（同种子结果完全一致）`;
  }

  function doRegenerate() {
    const lockedCount = $fieldStore.units.filter((u) => u.locked).length;
    regenerate(merged());
    message = lockedCount
      ? `已重排，${lockedCount} 个锁定单元保持不动`
      : '已重新布局（无锁定单元）';
  }

  function addType(t: UnitType) {
    seqDraft = [...seqDraft, t];
  }
  function removeAt(i: number) {
    seqDraft = seqDraft.filter((_, idx) => idx !== i);
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= seqDraft.length) return;
    const copy = [...seqDraft];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    seqDraft = copy;
  }
</script>

<div class="panel">
  <h3>场地参数</h3>
  <div class="row">
    <div class="field">
      <label>场地长 (mm)</label>
      <input type="number" min={4000} max={50000} step={500} bind:value={draft.length} />
    </div>
    <div class="field">
      <label>场地宽 (mm)</label>
      <input type="number" min={3000} max={30000} step={500} bind:value={draft.width} />
    </div>
  </div>

  <div class="field">
    <label>难度系数：{draft.difficulty.toFixed(2)}</label>
    <input type="range" min={0.1} max={1} step={0.05} bind:value={draft.difficulty} />
    <div class="scale muted"><span>简单</span><span>困难</span></div>
  </div>

  <div class="field">
    <label>随机种子（整数，同种子布局与高度完全一致）</label>
    <input type="number" bind:value={draft.seed} />
  </div>

  <h3>障碍序列（{seqDraft.length}）</h3>
  <div class="seq">
    {#each seqDraft as t, i (i)}
      <div class="seq-item">
        <span class="idx">{i + 1}</span>
        <span class="name">{UNIT_LABELS[t]}</span>
        <button title="前移" on:click={() => move(i, -1)}>←</button>
        <button title="后移" on:click={() => move(i, 1)}>→</button>
        <button class="danger" title="删除" on:click={() => removeAt(i)}>×</button>
      </div>
    {:else}
      <p class="muted">尚未添加任何障碍单元</p>
    {/each}
  </div>
  <div class="add-row">
    {#each ALL_UNIT_TYPES as t}
      <button on:click={() => addType(t)}>+ {UNIT_LABELS[t]}</button>
    {/each}
  </div>

  <div class="actions">
    <button class="primary" on:click={doGenerate}>生成新场地</button>
    <button class="warn" on:click={doRegenerate}>重新生成（保留锁定）</button>
  </div>
  {#if message}<p class="msg">{message}</p>{/if}
</div>

<style>
  .panel {
    padding: 12px;
  }
  .scale {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
  }
  .seq {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 220px;
    overflow: auto;
  }
  .seq-item {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--panel-2);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 4px 8px;
  }
  .seq-item .idx {
    color: var(--accent-2);
    font-weight: bold;
    width: 20px;
  }
  .seq-item .name {
    flex: 1;
  }
  .seq-item button {
    padding: 2px 8px;
  }
  .add-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 8px 0;
  }
  .add-row button {
    flex: 1 1 45%;
  }
  .actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 10px;
  }
  .msg {
    color: var(--accent-2);
    font-size: 12px;
  }
</style>
