<script>
  import { onMount, onDestroy } from 'svelte'
  import { SceneEngine } from './lib/SceneEngine.js'
  import {
    role, viewMode, showDimensions, room, instances, selected,
    liveConflicts, liveRejected, POS_STEP, ROT_STEP
  } from './lib/stores.js'
  import { loadAssignment } from './lib/workflow.js'
  import EquipPalette from './components/EquipPalette.svelte'
  import PropertyPanel from './components/PropertyPanel.svelte'
  import AssignmentPanel from './components/AssignmentPanel.svelte'
  import GradeBook from './components/GradeBook.svelte'

  let viewportEl
  let engine
  let leftTab = 'equip'   // equip | assignment
  let rightTab = 'prop'   // prop | grades

  onMount(() => {
    engine = new SceneEngine(viewportEl)
    loadAssignment()
  })
  onDestroy(() => engine?.dispose())

  function addAtCenter(type) {
    const rm = $room
    const id = instances.add(type, rm.L / 2, rm.W / 2)
    return id
  }

  function exportPNG() {
    const url = engine.exportTopPNG()
    const a = document.createElement('a')
    a.href = url
    a.download = `场地俯视布置_${Date.now()}.png`
    a.click()
  }

  function deleteSelected() {
    for (const id of $selected) instances.remove(id)
  }

  function duplicateSelected() {
    const id = [...$selected][0]
    if (id) instances.duplicate(id)
  }

  function clearAll() {
    if (confirm('确定清空全部器材？')) instances.clear()
  }
</script>

<div class="app">
  <header class="topbar">
    <div class="brand">🐾 宠物水疗康复中心 · 三维场地布置编辑器</div>
    <div class="center-tools">
      <div class="seg">
        <button class={$viewMode === 'persp' ? 'on' : ''}
          on:click={() => viewMode.set('persp')}>斜45° 漫游</button>
        <button class={$viewMode === 'top' ? 'on' : ''}
          on:click={() => viewMode.set('top')}>俯视正交</button>
      </div>
      <label class="chk">
        <input type="checkbox" bind:checked={$showDimensions} />
        俯视尺寸/间距标注
      </label>
      <button on:click={exportPNG}>导出俯视 PNG</button>
    </div>
    <div class="right-tools">
      <div class="seg">
        <button class={$role === 'teacher' ? 'on' : ''}
          on:click={() => role.set('teacher')}>带教老师</button>
        <button class={$role === 'student' ? 'on' : ''}
          on:click={() => role.set('student')}>康复师/学员</button>
      </div>
    </div>
  </header>

  <div class="body">
    <!-- 左栏 -->
    <aside class="left panel">
      <div class="tabs">
        <button class={leftTab === 'equip' ? 'on' : ''} on:click={() => leftTab = 'equip'}>器材库</button>
        <button class={leftTab === 'assignment' ? 'on' : ''} on:click={() => leftTab = 'assignment'}>
          {$role === 'teacher' ? '出题/提交' : '我的作业'}
        </button>
      </div>
      {#if leftTab === 'equip'}
        <EquipPalette onPick={addAtCenter} />
      {:else}
        <AssignmentPanel />
      {/if}
    </aside>

    <!-- 中栏 视口 -->
    <main class="viewport-wrap">
      <div class="viewport" bind:this={viewportEl}></div>

      <div class="hud top-hud">
        <span class="tag gray">场地 {$room.L}m × {$room.W}m</span>
        <span class="tag gray">器材 {$instances.length} 件</span>
        <span class="tag">已选 {$selected.size} 件</span>
        {#if $liveConflicts.size > 0}
          <span class="tag red">● {$liveConflicts.size} 件冲突/越界（标红，拒绝落位）</span>
        {:else}
          <span class="tag green">● 无碰撞</span>
        {/if}
      </div>

      {#if $liveRejected}
        <div class="hud reject-toast">{$liveRejected.msg || '落位被拒绝：包围盒相交或越界'}</div>
      {/if}

      <div class="hud bottom-hud">
        <span>吸附：平移 {POS_STEP}m / 旋转 {ROT_STEP}°</span>
        <span>左键框选 · Shift+点选多选 · 右键旋转视角 · 中键缩放</span>
        <span class="spacer"></span>
        <button on:click={duplicateSelected} disabled={$selected.size !== 1}>复制</button>
        <button class="danger" on:click={deleteSelected} disabled={$selected.size === 0}>删除选中</button>
        <button class="danger" on:click={clearAll} disabled={$instances.length === 0}>清空</button>
      </div>
    </main>

    <!-- 右栏 -->
    <aside class="right panel">
      <div class="tabs">
        <button class={rightTab === 'prop' ? 'on' : ''} on:click={() => rightTab = 'prop'}>属性/清单</button>
        <button class={rightTab === 'grades' ? 'on' : ''} on:click={() => rightTab = 'grades'}>
          {$role === 'teacher' ? '成绩册' : '我的成绩'}
        </button>
      </div>
      {#if rightTab === 'prop'}
        <PropertyPanel />
      {:else}
        <GradeBook />
      {/if}
    </aside>
  </div>
</div>

<style>
  .app { display: flex; flex-direction: column; height: 100%; }
  .topbar {
    display: flex; align-items: center; gap: 16px;
    padding: 8px 14px; background: #fff;
    border-bottom: 1px solid var(--line);
    flex-wrap: wrap;
  }
  .brand { font-weight: 700; font-size: 15px; white-space: nowrap; }
  .center-tools { display: flex; align-items: center; gap: 12px; flex: 1; flex-wrap: wrap; }
  .right-tools { margin-left: auto; }
  .seg { display: inline-flex; border: 1px solid var(--line); border-radius: 7px; overflow: hidden; }
  .seg button { border: none; border-radius: 0; }
  .seg button.on { background: var(--brand); color: #fff; }
  .chk { display: flex; align-items: center; gap: 4px; color: var(--muted); white-space: nowrap; }
  .body { flex: 1; display: flex; min-height: 0; gap: 10px; padding: 10px; }
  .left, .right { width: 288px; min-width: 288px; display: flex; flex-direction: column; overflow: hidden; }
  .tabs { display: flex; border-bottom: 1px solid var(--line); }
  .tabs button { flex: 1; border: none; border-radius: 0; padding: 9px 4px; }
  .tabs button.on { color: var(--brand); border-bottom: 2px solid var(--brand); font-weight: 600; }
  .viewport-wrap { flex: 1; position: relative; min-width: 0; border-radius: 10px; overflow: hidden; box-shadow: var(--shadow); }
  .viewport { width: 100%; height: 100%; }
  .viewport :global(canvas) { display: block; }
  .hud {
    position: absolute; display: flex; gap: 8px; align-items: center;
    pointer-events: none; flex-wrap: wrap;
  }
  .hud button { pointer-events: auto; }
  .top-hud { top: 10px; left: 10px; right: 10px; }
  .bottom-hud {
    bottom: 10px; left: 10px; right: 10px;
    background: rgba(255,255,255,0.92); border-radius: 8px;
    padding: 6px 10px; color: var(--muted); gap: 12px;
  }
  .spacer { flex: 1; }
  .reject-toast {
    top: 52px; left: 50%; transform: translateX(-50%);
    background: var(--danger); color: #fff; padding: 8px 18px;
    border-radius: 8px; font-weight: 600; box-shadow: var(--shadow);
  }
</style>
