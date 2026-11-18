<script>
import {
  layers, role, records, reports, applications, cages,
  addRecord, editRecord, diffRecord, requestArchive, approveArchive,
  applyIsolation, releaseIsolation, setCageStatus, toast,
} from '../lib/store.js'
import { STATUS, BREEDS, ROOM_LABEL } from '../lib/data.js'

let tab = 'layers'
const tabs = [
  ['layers', '图层控制'],
  ['intake', '入站建档'],
  ['archive', '档案检索'],
  ['flow', '审批工作流'],
]

// ---- 入站建档表单 ----
const EMOJIS = ['🐶', '🐱', '🐰', '🐹', '🦜']
const FILTERS = { none: '原图', warm: '暖色', cool: '冷色', retro: '复古' }
const FILTER_CSS = { none: 'none', warm: 'sepia(.5) saturate(1.4)', cool: 'hue-rotate(180deg) saturate(1.2)', retro: 'sepia(.8) contrast(.9)' }
let f = { species: '犬', breed: '中华田园犬', gender: '公', emoji: '🐶', filter: 'none', cageId: '', notes: '' }
$: emptyCages = $cages.filter((c) => c.status === 'empty')

function submitIntake() {
  if ($role === 'vet') { toast('兽医角色不能建档'); return }
  const cage = $cages.find((c) => c.code === f.cageId)
  if (!cage || cage.status !== 'empty') { toast('请选择空置笼位'); return }
  const rec = addRecord({ ...f })
  setCageStatus([f.cageId], 'occupied', {
    name: rec.code, species: f.species, breed: f.breed, emoji: f.emoji,
    gender: f.gender, intakeDate: rec.intakeDate,
  })
  toast(`建档成功:${rec.code} → ${f.cageId}`)
  f = { ...f, cageId: '', notes: '' }
}

// ---- 加工(编辑生成新版本) ----
let editingId = null
let ef = {}
function startEdit(r) { editingId = r.id; ef = { breed: r.breed, emoji: r.emoji, filter: r.filter, notes: r.notes } }
function saveEdit() {
  editRecord(editingId, ef, '加工照片/信息')
  editingId = null
  toast('已保存新版本')
}

// ---- 档案检索 ----
let af = { breed: '', from: '', to: '', cage: '' }
$: archived = $records.filter((r) =>
  r.archiveStatus === 'approved' &&
  (!af.breed || r.breed.includes(af.breed)) &&
  (!af.from || r.intakeDate >= af.from) &&
  (!af.to || r.intakeDate <= af.to) &&
  (!af.cage || r.cageId.includes(af.cage.toUpperCase()))
)

// ---- 隔离申请 ----
let isoCage = ''
let isoReason = ''
$: occupiedCages = $cages.filter((c) => c.status === 'occupied' || c.status === 'adoptable')
function submitIso() {
  if ($role !== 'staff') { toast('只有收容员可以提交隔离申请'); return }
  const cage = $cages.find((c) => c.code === isoCage)
  if (!cage || cage.status === 'empty' || cage.status === 'isolation') { toast('笼位不可用(需在住/待领养)'); return }
  applyIsolation(isoCage, isoReason || '未填写')
  isoCage = ''; isoReason = ''
}

$: pendingArchive = $records.filter((r) => r.archiveStatus === 'pending')
</script>

<aside>
  <nav>
    {#each tabs as [k, label]}
      <button class:active={tab === k} on:click={() => (tab = k)}>{label}</button>
    {/each}
  </nav>

  <div class="body">
    {#if tab === 'layers'}
      <h3>图层开关</h3>
      <label class="row"><input type="checkbox" bind:checked={$layers.cages} /> 笼位层(1344 个笼位)</label>
      <label class="row"><input type="checkbox" bind:checked={$layers.isolation} /> 隔离层(隔离间)</label>
      <label class="row"><input type="checkbox" bind:checked={$layers.equipment} /> 设备层(摄像头 / 医疗间 / 洗消间)</label>
      <label class="row"><input type="checkbox" bind:checked={$layers.corridors} /> 通道层</label>

      <h3>状态图例</h3>
      {#each Object.entries(STATUS) as [, s]}
        <div class="row legend"><i style="background:{s.css}"></i>{s.label} <span class="badge">{s.badge}</span></div>
      {/each}

      <h3>设施图例</h3>
      <div class="row legend"><i style="background:#d94d4d"></i>{ROOM_LABEL.isolation}</div>
      <div class="row legend"><i style="background:#4dbfbf"></i>{ROOM_LABEL.medical}</div>
      <div class="row legend"><i style="background:#8c8cf0"></i>{ROOM_LABEL.wash}</div>
      <div class="row legend"><i style="background:#b859f2"></i>摄像头点位</div>

      <h3>缩放细节级别</h3>
      <p class="hint">最远:区域色块<br />中等:笼位轮廓 + 编号<br />最近:照片缩略图 / 隔离标记 / 观察到期日</p>

    {:else if tab === 'intake'}
      <h3>入站建档</h3>
      <div class="form">
        <label>物种
          <select bind:value={f.species} on:change={() => { f.breed = BREEDS[f.species][0]; f.emoji = f.species === '猫' ? '🐱' : '🐶' }}>
            <option>犬</option><option>猫</option>
          </select>
        </label>
        <label>品种
          <select bind:value={f.breed}>
            {#each BREEDS[f.species] as b}<option>{b}</option>{/each}
          </select>
        </label>
        <label>性别
          <select bind:value={f.gender}><option>公</option><option>母</option></select>
        </label>
        <label>照片
          <span class="emojis">
            {#each EMOJIS as e}
              <button class:sel={f.emoji === e} on:click={() => (f.emoji = e)}>{e}</button>
            {/each}
          </span>
        </label>
        <label>滤镜
          <select bind:value={f.filter}>
            {#each Object.entries(FILTERS) as [k, v]}<option value={k}>{v}</option>{/each}
          </select>
          <span class="preview" style="filter:{FILTER_CSS[f.filter]}">{f.emoji}</span>
        </label>
        <label>笼位
          <input list="empty-cages" bind:value={f.cageId} placeholder="选择空置笼位" />
          <datalist id="empty-cages">
            {#each emptyCages.slice(0, 300) as c}<option value={c.code} />{/each}
          </datalist>
        </label>
        <label>备注<textarea rows="2" bind:value={f.notes}></textarea></label>
        <button class="primary" on:click={submitIntake}>提交建档</button>
      </div>

      <h3>建档记录({$records.length})</h3>
      {#each $records as r (r.id)}
        <div class="rec">
          <div class="rec-head">
            <span class="photo" style="filter:{FILTER_CSS[r.filter] || 'none'}">{r.emoji}</span>
            <b>{r.code}</b> {r.breed} · {r.gender} · 笼位 {r.cageId}
          </div>
          <div class="dim">入站 {r.intakeDate} · v{r.versions.length}
            {#if r.archiveStatus === 'pending'} · <span class="warn">待站长审核</span>
            {:else if r.archiveStatus === 'approved'} · <span class="ok">已归档</span>{/if}
          </div>
          {#if editingId === r.id}
            <div class="form editbox">
              <label>品种<input bind:value={ef.breed} /></label>
              <label>照片
                <span class="emojis">
                  {#each EMOJIS as e}<button class:sel={ef.emoji === e} on:click={() => (ef.emoji = e)}>{e}</button>{/each}
                </span>
              </label>
              <label>滤镜
                <select bind:value={ef.filter}>
                  {#each Object.entries(FILTERS) as [k, v]}<option value={k}>{v}</option>{/each}
                </select>
              </label>
              <label>备注<textarea rows="2" bind:value={ef.notes}></textarea></label>
              <div class="btnrow">
                <button class="primary" on:click={saveEdit}>保存新版本</button>
                <button on:click={() => (editingId = null)}>取消</button>
              </div>
            </div>
          {:else}
            <div class="btnrow">
              <button on:click={() => startEdit(r)}>加工照片/信息</button>
              <button on:click={() => diffRecord(r.id)}>比对版本出报告</button>
              {#if r.archiveStatus === 'none'}
                <button on:click={() => ($role === 'vet' ? toast('兽医不能申请归档') : requestArchive(r.id))}>申请归档</button>
              {/if}
            </div>
          {/if}
        </div>
      {/each}

      {#if $reports.length}
        <h3>比对报告({$reports.length})</h3>
        {#each $reports as rep (rep.id)}
          <div class="rec">
            <div><b>{rep.recCode}</b> v{rep.fromV} → v{rep.toV} <span class="dim">{rep.time}</span></div>
            {#if rep.changes.length === 0}
              <div class="dim">无字段变更</div>
            {:else}
              {#each rep.changes as ch}
                <div class="diff">{ch.field}:<s>{ch.from}</s> → <b>{ch.to}</b></div>
              {/each}
            {/if}
          </div>
        {/each}
      {/if}

    {:else if tab === 'archive'}
      <h3>档案检索(已归档 {archived.length})</h3>
      <div class="form">
        <label>品种<input bind:value={af.breed} placeholder="如:金毛 / 橘猫" /></label>
        <label>入站日期从<input type="date" bind:value={af.from} /></label>
        <label>到<input type="date" bind:value={af.to} /></label>
        <label>笼位<input bind:value={af.cage} placeholder="如:A-0305" /></label>
      </div>
      {#each archived as r (r.id)}
        <div class="rec">
          <div class="rec-head">
            <span class="photo" style="filter:{FILTER_CSS[r.filter] || 'none'}">{r.emoji}</span>
            <b>{r.code}</b> {r.breed} · {r.gender}
          </div>
          <div class="dim">笼位 {r.cageId} · 入站 {r.intakeDate} · {r.approvedBy}审核于 {r.approveTime}</div>
          {#if r.notes}<div class="dim">备注:{r.notes}</div>{/if}
        </div>
      {:else}
        <p class="hint">暂无匹配的归档记录。先在「入站建档」建档并申请归档,由站长审核后可检索。</p>
      {/each}

    {:else if tab === 'flow'}
      <h3>隔离申请(收容员 → 兽医)</h3>
      <div class="form">
        <label>笼位
          <input list="occ-cages" bind:value={isoCage} placeholder="在住/待领养笼位" />
          <datalist id="occ-cages">
            {#each occupiedCages.slice(0, 300) as c}<option value={c.code} />{/each}
          </datalist>
        </label>
        <label>原因<input bind:value={isoReason} placeholder="如:疑似传染病" /></label>
        <button class="primary" on:click={submitIso}>提交隔离申请</button>
      </div>
      {#each $applications as a (a.id)}
        <div class="rec">
          <div><b>{a.cageCode}</b>
            {#if a.status === '隔离中'}<span class="warn">隔离中</span>{:else}<span class="ok">已解除</span>{/if}
          </div>
          <div class="dim">{a.by} 申请于 {a.time} · 原因:{a.reason}</div>
          {#if a.status === '隔离中'}
            <div class="btnrow">
              <button on:click={() => ($role === 'vet' || $role === 'director' ? releaseIsolation(a.id) : toast('需要兽医确认解除'))}>兽医确认解除隔离</button>
            </div>
          {:else}
            <div class="dim">{a.vetBy} 解除于 {a.releaseTime}</div>
          {/if}
        </div>
      {:else}
        <p class="hint">暂无隔离申请</p>
      {/each}

      <h3>归档审核(站长)</h3>
      {#each pendingArchive as r (r.id)}
        <div class="rec">
          <div class="rec-head"><span class="photo">{r.emoji}</span><b>{r.code}</b> {r.breed} · 笼位 {r.cageId}</div>
          <div class="dim">入站 {r.intakeDate} · v{r.versions.length}</div>
          <div class="btnrow">
            <button class="primary" on:click={() => ($role === 'director' ? approveArchive(r.id) : toast('需要站长角色审核'))}>审核通过</button>
          </div>
        </div>
      {:else}
        <p class="hint">暂无待审核的归档申请</p>
      {/each}
    {/if}
  </div>
</aside>

<style>
aside { width: 340px; min-width: 340px; background: #181b22; border-left: 1px solid #2c3242; display: flex; flex-direction: column; color: #dfe6f2; }
nav { display: flex; border-bottom: 1px solid #2c3242; }
nav button { flex: 1; background: none; border: none; color: #8b95ab; padding: 10px 0; font-size: 13px; cursor: pointer; border-bottom: 2px solid transparent; }
nav button.active { color: #fff; border-bottom-color: #4da3ff; }
.body { flex: 1; overflow-y: auto; padding: 12px 14px; }
h3 { font-size: 13px; color: #8fa3c8; margin: 16px 0 8px; text-transform: uppercase; letter-spacing: .5px; }
h3:first-child { margin-top: 0; }
.row { display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 4px 0; cursor: pointer; }
.legend i { width: 14px; height: 14px; border-radius: 3px; display: inline-block; }
.legend .badge { margin-left: 4px; }
.hint { font-size: 12px; color: #7c8699; line-height: 1.8; }
.form { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
.form label { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #9aa4b8; }
.form label > :first-child:not(span) { flex: 1; }
input, select, textarea {
  background: #232837; border: 1px solid #36405a; color: #e6ecf7; border-radius: 6px;
  padding: 5px 8px; font-size: 12px; font-family: inherit;
}
textarea { resize: vertical; }
button { background: #2a3040; color: #cfd8ea; border: 1px solid #3a4358; border-radius: 6px; padding: 4px 10px; font-size: 12px; cursor: pointer; }
button:hover { background: #343c52; }
button.primary { background: #2f5b8f; border-color: #4da3ff; color: #fff; }
button.primary:hover { background: #3a6dab; }
.emojis { display: flex; gap: 4px; }
.emojis button { font-size: 16px; padding: 2px 6px; }
.emojis button.sel { border-color: #4da3ff; background: #2f5b8f; }
.preview { font-size: 22px; }
.rec { background: #20242f; border: 1px solid #2e3547; border-radius: 8px; padding: 8px 10px; margin-bottom: 8px; font-size: 12px; line-height: 1.7; }
.rec-head { display: flex; align-items: center; gap: 6px; }
.photo { font-size: 18px; }
.dim { color: #8b95ab; }
.warn { color: #ffb454; }
.ok { color: #4fd08a; }
.diff { font-size: 12px; }
.diff s { color: #8b95ab; margin: 0 4px; }
.btnrow { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
.editbox { margin-top: 8px; border-top: 1px dashed #36405a; padding-top: 8px; }
</style>
