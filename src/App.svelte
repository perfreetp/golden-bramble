<script>
import MapView from './components/MapView.svelte'
import SidePanel from './components/SidePanel.svelte'
import { role, roles, searchTarget, toasts } from './lib/store.js'

let q = ''
function search() {
  if (q.trim()) searchTarget.set(q.trim())
}
</script>

<header>
  <h1>🐾 宠物救助站 · 分层收容笼舍平面图</h1>
  <div class="spacer"></div>
  <input
    placeholder="搜索笼位编号,如 A-0305"
    bind:value={q}
    on:keydown={(e) => e.key === 'Enter' && search()}
  />
  <button on:click={search}>定位</button>
  <span class="role-label">当前角色</span>
  <select bind:value={$role}>
    {#each Object.entries(roles) as [k, v]}
      <option value={k}>{v}</option>
    {/each}
  </select>
</header>

<main>
  <MapView />
  <SidePanel />
</main>

<div class="toasts">
  {#each $toasts as t (t.id)}
    <div class="toast">{t.msg}</div>
  {/each}
</div>

<style>
header {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 14px; background: #14171e; border-bottom: 1px solid #2c3242;
}
h1 { font-size: 15px; color: #e8ecf4; margin: 0; white-space: nowrap; }
.spacer { flex: 1; }
header input {
  width: 220px; background: #232837; border: 1px solid #36405a; color: #e6ecf7;
  border-radius: 6px; padding: 6px 10px; font-size: 13px;
}
header button {
  background: #2f5b8f; border: 1px solid #4da3ff; color: #fff;
  border-radius: 6px; padding: 6px 14px; font-size: 13px; cursor: pointer;
}
header select {
  background: #232837; border: 1px solid #36405a; color: #e6ecf7;
  border-radius: 6px; padding: 6px 8px; font-size: 13px;
}
.role-label { font-size: 12px; color: #8b95ab; }
main { flex: 1; display: flex; min-height: 0; }
.toasts { position: fixed; top: 54px; left: 50%; transform: translateX(-50%); z-index: 99; display: flex; flex-direction: column; gap: 6px; }
.toast {
  background: rgba(30, 35, 48, 0.96); color: #e8ecf4; border: 1px solid #4da3ff;
  border-radius: 8px; padding: 8px 16px; font-size: 13px; box-shadow: 0 6px 20px rgba(0,0,0,.5);
}
</style>
