<script>
  import { onMount } from 'svelte'
  import { instances, selected, room, assignment, flashReject } from '../lib/stores.js'
  import {
    modelOptions, getModel, getTypeDef
  } from '../lib/catalog.js'
  import { buildInventoryCsv, downloadText, validateLayout } from '../lib/rules.js'

  function grouped(list) {
    const map = new Map()
    for (const i of list) {
      const key = `${i.type}|${i.modelId}`
      const m = getModel(i.type, i.modelId)
      const def = getTypeDef(i.type)
      if (!map.has(key)) {
        map.set(key, {
          key, modelId: m.id, typeLabel: def.label,
          count: 0, water: def.water, waterArea: 0
        })
      }
      const g = map.get(key)
      g.count += 1
      if (def.water) g.waterArea += m.L * m.W * (i.scale ?? 1) ** 2
    }
    return [...map.values()]
  }

  let dropRef
  onMount(() => {
    const el = dropRef
    el.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' })
    el.addEventListener('drop', e => {
      e.preventDefault()
      const type = e.dataTransfer.getData('application/x-equip-type')
      if (!type) return
      const r = el.getBoundingClientRect()
      const ndc = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }
      window.dispatchEvent(new CustomEvent('psle-drop', { detail: { type, ndc } }))
    })
  })

  $: selectedList = $instances.filter(i => $selected.has(i.id))
  $: primary = selectedList[0]
  $: validation = validateLayout($instances, $room)
  $: totalWater = $instances.reduce((sum, i) => {
    const m = getModel(i.type, i.modelId)
    const def = getTypeDef(i.type)
    return sum + (def.water ? m.L * m.W * (i.scale ?? 1) ** 2 : 0)
  }, 0)

  function exportCsv() {
    downloadText(`器材清单_${Date.now()}.csv`, buildInventoryCsv($instances))
  }

  function changeModel(inst, modelId) {
    instances.changeModel(inst.id, modelId)
  }

  function numPatch(inst, field, value) {
    const v = Math.round(parseFloat(value) * 10) / 10
    if (Number.isNaN(v)) return
    const ok = instances.tryTransform(inst.id, { [field]: v })
    if (!ok) flashReject('调整被拒绝：包围盒相交或越界')
  }

  function rotPatch(inst, deg) {
    const rad = Math.round(deg / 15) * (Math.PI / 12)
    const ok = instances.tryTransform(inst.id, { rotY: rad })
    if (!ok) flashReject('旋转被拒绝：包围盒相交或越界')
  }
</script>

<div bind:this={dropRef} class="prop">
  <!-- 场地设置 -->
  <section class="block">
    <h3>场地设置（米）</h3>
    <div class="row">
      <label>长 <input type="number" min="2" max="30" step="0.5"
        value={$room.L}
        on:change={(e) => room.update(r => ({ ...r, L: Math.max(2, +e.target.value || r.L) }))} /></label>
      <label>宽 <input type="number" min="2" max="30" step="0.5"
        value={$room.W}
        on:change={(e) => room.update(r => ({ ...r, W: Math.max(2, +e.target.value || r.W) }))} /></label>
    </div>
    {#if $assignment}
      <p class="note">作业场地锁定为 {$assignment.room.L}m × {$assignment.room.W}m，修改尺寸仅影响自由练习。</p>
    {/if}
  </section>

  <!-- 选中器材属性 -->
  <section class="block">
    <h3>器材属性 {primary ? '' : '（未选中）'}</h3>
    {#if primary}
      {@const model = getModel(primary.type, primary.modelId)}
      {@const def = getTypeDef(primary.type)}
      <div class="row"><span class="muted">类型</span><b>{def.label}</b>
        <span class="tag gray">#{primary.serial}</span></div>
      <label class="full">型号（更换后三维尺寸同步）
        <select value={primary.modelId}
          on:change={(e) => changeModel(primary, e.target.value)}>
          {#each modelOptions(primary.type) as opt}
            <option value={opt.id}>{opt.name}</option>
          {/each}
        </select>
      </label>
      <div class="row">
        <label>X(m) <input type="number" step="0.1" value={primary.x.toFixed(1)}
          on:change={(e) => numPatch(primary, 'x', +e.target.value)} /></label>
        <label>Z(m) <input type="number" step="0.1" value={primary.z.toFixed(1)}
          on:change={(e) => numPatch(primary, 'z', +e.target.value)} /></label>
      </div>
      <div class="row">
        <label>离地Y(m) <input type="number" step="0.1" value={primary.y.toFixed(1)}
          on:change={(e) => numPatch(primary, 'y', +e.target.value)} /></label>
        <label>旋转(°) <input type="number" step="15" value={Math.round(primary.rotY * 180 / Math.PI)}
          on:change={(e) => rotPatch(primary, +e.target.value)} /></label>
      </div>
      <div class="row">
        <label>缩放 <input type="number" step="0.1" min="0.3" max="3" value={primary.scale}
          on:change={(e) => numPatch(primary, 'scale', Math.max(0.3, +e.target.value))} /></label>
        <span class="muted dim">实际占地 {(model.L * primary.scale).toFixed(2)} × {(model.W * primary.scale).toFixed(2)} m</span>
      </div>
      {#if selectedList.length > 1}
        <p class="note">已多选 {selectedList.length} 件，数值编辑作用于首件；三维手柄可整组平移/旋转/缩放。</p>
      {/if}
    {:else}
      <p class="muted">在视口中点选或框选器材后可编辑型号、坐标、旋转与缩放。</p>
    {/if}
  </section>

  <!-- 实时校验 -->
  <section class="block">
    <h3>实时规则校验</h3>
    {#if validation.issues.length === 0}
      <p class="ok">✓ 无重叠、无越界、全部贴地</p>
    {:else}
      <ul class="issues">
        {#each validation.issues as iss}
          <li class:bad={iss.code !== 'floating'}>
            <span class="dot {iss.code}"></span>{iss.text}
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  <!-- 清单 -->
  <section class="block grow">
    <div class="h3-row">
      <h3>器材清单</h3>
      <button on:click={exportCsv} disabled={$instances.length === 0}>导出 CSV</button>
    </div>
    <table>
      <thead>
        <tr><th>型号</th><th>类型</th><th>数量</th><th>水面m²</th></tr>
      </thead>
      <tbody>
        {#each grouped($instances) as g (g.key)}
          <tr>
            <td>{g.modelId}</td>
            <td>{g.typeLabel}</td>
            <td>{g.count}</td>
            <td>{g.water ? g.waterArea.toFixed(2) : '—'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    <div class="summary">
      <div>器材总数 <b>{$instances.length}</b> 件</div>
      <div>总水面面积 <b class="blue">{totalWater.toFixed(2)}</b> m²</div>
    </div>
  </section>
</div>

<style>
  .prop { overflow-y: auto; flex: 1; padding: 10px; display: flex; flex-direction: column; }
  .block { border-bottom: 1px solid var(--line); padding-bottom: 10px; margin-bottom: 10px; }
  .block.grow { flex: 1; }
  h3 { margin: 4px 0 8px; font-size: 13px; }
  .h3-row { display: flex; align-items: center; justify-content: space-between; }
  .row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap; }
  .row label { display: flex; align-items: center; gap: 4px; }
  .full { display: block; margin-bottom: 8px; }
  .full select { width: 100%; margin-top: 4px; }
  .muted { color: var(--muted); }
  .note { color: var(--warn); font-size: 11px; margin: 6px 0 0; line-height: 1.5; }
  .dim { font-size: 11px; }
  .ok { color: var(--ok); font-weight: 600; }
  .issues { list-style: none; padding: 0; margin: 0; }
  .issues li { padding: 4px 0; font-size: 12px; display: flex; gap: 6px; align-items: center; }
  .dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }
  .dot.overlap, .dot.bounds { background: var(--danger); }
  .dot.floating { background: var(--warn); }
  .summary { display: flex; justify-content: space-between; margin-top: 10px; padding: 8px;
    background: var(--brand-soft); border-radius: 8px; }
  .blue { color: var(--brand); }
</style>
