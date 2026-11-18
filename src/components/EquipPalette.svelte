<script>
  import { createEventDispatcher } from 'svelte'
  import { EQUIP_CATALOG } from '../lib/catalog.js'

  export let onPick
  const dispatch = createEventDispatcher()

  function dragStart(e, type) {
    e.dataTransfer.setData('application/x-equip-type', type)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const icons = {
    pool: '🏊', ramp: '📐', treadmill: '🏃',
    mat: '🟩', fence: '🚧', post: '🔗'
  }
</script>

<div class="palette">
  <p class="hint">拖拽器材到三维场地，或点击卡片放到场地中心。共 6 类器材、多型号可选。</p>
  {#each EQUIP_CATALOG as cat (cat.type)}
    {@const m0 = cat.models[0]}
    <div class="card"
      draggable="true"
      on:dragstart={(e) => dragStart(e, cat.type)}
      on:click={() => onPick(cat.type)}
      role="button"
      tabindex="0"
      on:keydown={(e) => e.key === 'Enter' && onPick(cat.type)}
    >
      <div class="icon">{icons[cat.type] || '📦'}</div>
      <div class="meta">
        <div class="name">
          {cat.label}
          {#if cat.water}<span class="tag">水面</span>{/if}
        </div>
        <div class="sub">{cat.models.length} 个型号 · 默认 {m0.id}</div>
        <div class="sub dim">{m0.L} × {m0.W} × {m0.H} m</div>
      </div>
    </div>
  {/each}
</div>

<style>
  .palette { padding: 10px; overflow-y: auto; flex: 1; }
  .hint { color: var(--muted); margin: 2px 0 10px; line-height: 1.5; }
  .card {
    display: flex; gap: 10px; align-items: center;
    border: 1px solid var(--line); border-radius: 8px;
    padding: 8px 10px; margin-bottom: 8px; cursor: grab;
    transition: border-color .15s, box-shadow .15s;
    background: #fff;
  }
  .card:hover { border-color: var(--brand); box-shadow: var(--shadow); }
  .card:active { cursor: grabbing; }
  .icon { font-size: 24px; width: 38px; text-align: center; }
  .name { font-weight: 600; display: flex; gap: 6px; align-items: center; }
  .sub { color: var(--muted); font-size: 11px; margin-top: 2px; }
  .dim { font-variant-numeric: tabular-nums; }
</style>
