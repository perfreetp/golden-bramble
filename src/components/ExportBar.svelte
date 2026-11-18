<script lang="ts">
  import { fieldStore, saveProblem, problemStore, currentProblemId, loadProblem, deleteProblem } from '../lib/stores';
  import { fieldParamsCsv, downloadText } from '../lib/exporters';
  import type { CourseRenderer } from '../lib/babylon/CourseRenderer';

  export let rendererRef: CourseRenderer | null = null;

  let title = '';
  let exporting = false;

  async function exportGlb() {
    if (!rendererRef) return;
    exporting = true;
    try {
      await rendererRef.exportGlb(`场地_种子${$fieldStore.config.seed}.glb`);
    } catch (e) {
      alert('GLB 导出失败：' + (e as Error).message);
    } finally {
      exporting = false;
    }
  }

  function exportCsv() {
    downloadText(`场地参数_种子${$fieldStore.config.seed}.csv`, fieldParamsCsv($fieldStore));
  }

  function saveAsProblem() {
    const t = title.trim() || `题目_种子${$fieldStore.config.seed}`;
    const id = saveProblem(t);
    title = '';
    alert(`题目已保存：${t}（${id}）`);
  }
</script>

<div class="export-bar">
  <h3>导出与题库</h3>
  <div class="btn-row">
    <button class="primary" on:click={exportGlb} disabled={exporting}>
      {exporting ? '导出中…' : '导出 GLB 模型'}
    </button>
    <button on:click={exportCsv}>导出参数表 CSV</button>
  </div>

  <div class="field">
    <label>保存当前场地为题目</label>
    <div class="btn-row">
      <input placeholder="题目名称，如 期中考核场地 A" bind:value={title} />
      <button class="warn" on:click={saveAsProblem}>保存题目</button>
    </div>
  </div>

  <div class="problems scroll">
    {#each $problemStore as p (p.id)}
      <div class="problem" class:active={p.id === $currentProblemId}>
        <div>
          <div>{p.title}</div>
          <div class="muted small">
            {p.id} · {new Date(p.createdAt).toLocaleString('zh-CN')} · {p.field.units.length} 单元
          </div>
        </div>
        <div class="p-actions">
          <button on:click={() => loadProblem(p.id)}>载入</button>
          <button class="danger" on:click={() => confirm('删除该题目？') && deleteProblem(p.id)}>删除</button>
        </div>
      </div>
    {:else}
      <p class="muted small">题库为空</p>
    {/each}
  </div>
</div>

<style>
  .export-bar {
    padding: 12px;
  }
  .btn-row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }
  .btn-row input {
    flex: 2;
  }
  .btn-row button {
    flex: 1;
    white-space: nowrap;
  }
  .problems {
    max-height: 200px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .problem {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 6px 8px;
    background: var(--panel-2);
  }
  .problem.active {
    border-color: var(--accent);
  }
  .p-actions {
    display: flex;
    gap: 4px;
    align-items: center;
  }
  .p-actions button {
    padding: 3px 8px;
  }
  .small {
    font-size: 11px;
  }
</style>
