<script lang="ts">
  import View3D from './components/View3D.svelte';
  import ConfigPanel from './components/ConfigPanel.svelte';
  import UnitPanel from './components/UnitPanel.svelte';
  import ExportBar from './components/ExportBar.svelte';
  import StudentSubmit from './components/StudentSubmit.svelte';
  import TeacherReview from './components/TeacherReview.svelte';
  import { fieldStore, submissionStore, resetAll } from './lib/stores';
  import type { CourseRenderer } from './lib/babylon/CourseRenderer';

  type Tab = 'field' | 'submit' | 'review';
  let tab: Tab = 'field';
  let rendererRef: CourseRenderer | null = null;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'field', label: '场地编辑' },
    { id: 'submit', label: '学员提交' },
    { id: 'review', label: '教师复核' },
  ];

  $: lockedCount = $fieldStore.units.filter((u) => u.locked).length;
  $: pendingCount = $submissionStore.filter((s) => s.reviewScore === null).length;
</script>

<div class="app">
  <header>
    <div class="brand">机器人越障赛 · 场地过程式生成与考核系统</div>
    <nav>
      {#each tabs as t}
        <button class:primary={tab === t.id} on:click={() => (tab = t.id)}>
          {t.label}
          {#if t.id === 'review' && pendingCount > 0}<span class="badge">{pendingCount}</span>{/if}
        </button>
      {/each}
      <button class="danger" on:click={() => confirm('清空全部场地、题库与提交记录？') && resetAll()}>
        重置数据
      </button>
    </nav>
  </header>

  {#if tab === 'field'}
    <main class="field-layout">
      <aside class="side left scroll">
        <ConfigPanel />
      </aside>
      <section class="canvas-wrap">
        <View3D bind:rendererRef />
        <div class="footer-stat">
          场地 {$fieldStore.config.length}×{$fieldStore.config.width}mm ·
          难度 {$fieldStore.config.difficulty.toFixed(2)} · 种子 {$fieldStore.config.seed} ·
          单元 {$fieldStore.units.length}（锁定 {lockedCount}）
        </div>
      </section>
      <aside class="side right scroll">
        <UnitPanel />
        <ExportBar {rendererRef} />
      </aside>
    </main>
  {:else if tab === 'submit'}
    <main class="plain scroll">
      <StudentSubmit />
    </main>
  {:else}
    <main class="plain scroll">
      <TeacherReview />
    </main>
  {/if}
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    background: var(--panel);
    border-bottom: 1px solid var(--border);
    gap: 12px;
    flex-wrap: wrap;
  }
  .brand {
    font-weight: bold;
    color: var(--accent-2);
    white-space: nowrap;
  }
  nav {
    display: flex;
    gap: 8px;
  }
  .badge {
    background: var(--bad);
    border-radius: 10px;
    padding: 0 7px;
    margin-left: 4px;
    font-size: 11px;
  }
  .field-layout {
    flex: 1;
    display: grid;
    grid-template-columns: 300px 1fr 340px;
    min-height: 0;
  }
  .side {
    background: var(--panel);
    border-right: 1px solid var(--border);
    overflow-y: auto;
  }
  .side.right {
    border-right: none;
    border-left: 1px solid var(--border);
  }
  .canvas-wrap {
    position: relative;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .footer-stat {
    padding: 6px 12px;
    font-size: 12px;
    color: var(--muted);
    background: var(--panel);
    border-top: 1px solid var(--border);
  }
  .plain {
    flex: 1;
    overflow: auto;
  }
  @media (max-width: 1200px) {
    .field-layout {
      grid-template-columns: 260px 1fr 300px;
    }
  }
</style>
