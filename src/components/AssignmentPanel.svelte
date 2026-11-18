<script>
  import { EQUIP_CATALOG } from '../lib/catalog.js'
  import {
    role, room, assignment, instances, submission, selected
  } from '../lib/stores.js'
  import {
    createAssignment, submitCurrentLayout, clearAssignment, loadSubmissionToCanvas
  } from '../lib/workflow.js'

  let studentName = ''
  let note = ''
  let required = {}

  $: if ($assignment) {
    required = { ...$assignment.required }
    studentName = $assignment.studentName || studentName
  }

  function setReq(type, val) {
    const n = Math.max(0, parseInt(val, 10) || 0)
    required = { ...required, [type]: n }
  }
  $: totalCount = Object.values(required).reduce((s, v) => s + (Number(v) || 0), 0)

  function publish() {
    const a = createAssignment({ required, note, studentName })
    room.set({ ...a.room })
    instances.clear()
    alert(`作业已发布：${a.room.L}m×${a.room.W}m 场地，必摆 ${a.count} 件。学员可开始布置并提交。`)
  }

  function doSubmit() {
    try {
      const rec = submitCurrentLayout()
      alert(`提交成功！系统自动评分 ${rec.auto.score} 分，扣分项 ${rec.auto.deductions.length} 条，等待老师复核。`)
    } catch (err) {
      alert(err.message)
    }
  }

  function cancelAssignment() {
    if (confirm('撤销当前作业？')) clearAssignment()
  }
</script>

<div class="asg">
  {#if $role === 'teacher'}
    <section class="block">
      <h3>老师出题</h3>
      <label class="full">学员姓名
        <input type="text" placeholder="如：张康复" bind:value={studentName} />
      </label>
      <p class="muted">按当前场地尺寸（{$room.L}m × {$room.W}m）设定各类器材<b>必摆件数</b>：</p>
      {#each EQUIP_CATALOG as cat (cat.type)}
        <div class="req-row">
          <span>{cat.label}</span>
          <input type="number" min="0" max="20" value={required[cat.type] ?? 0}
            on:change={(e) => setReq(cat.type, e.target.value)} />
        </div>
      {/each}
      <label class="full">作业说明
        <textarea rows="3" bind:value={note} placeholder="如：泳池周边预留 0.8m 操作通道，坡道入水…"></textarea>
      </label>
      <div class="row-between">
        <span>必摆合计 <b>{totalCount}</b> 件</span>
        <button class="primary" on:click={publish} disabled={totalCount === 0}>发布作业</button>
      </div>
      {#if $assignment}
        <button class="danger full-btn" on:click={cancelAssignment}>撤销当前作业</button>
      {/if}
    </section>
  {/if}

  {#if $assignment}
    <section class="block">
      <h3>当前作业（{$role === 'teacher' ? '老师视角' : '学员视角'}）</h3>
      <div class="asg-card">
        <div><span class="muted">学员：</span>{$assignment.studentName || '—'}</div>
        <div><span class="muted">场地：</span>{$assignment.room.L}m × {$assignment.room.W}m</div>
        <div><span class="muted">必摆件数：</span>
          {#each Object.entries($assignment.required) as [type, n] (type)}
            {#if n > 0}
              <span class="tag">{EQUIP_CATALOG.find(c => c.type === type)?.label} ×{n}</span>
            {/if}
          {/each}
        </div>
        {#if $assignment.note}<p class="note">{$assignment.note}</p>{/if}
        <div class="muted small">发布于 {$assignment.createdAt}</div>
      </div>
      {#if $role === 'student'}
        <button class="primary full-btn" on:click={doSubmit}>提交布置（自动查重叠/越界/未贴地）</button>
      {/if}
    </section>
  {:else if $role === 'student'}
    <p class="muted">老师尚未发布作业，可在自由练习模式下布置器材。</p>
  {/if}

  {#if $submission}
    <section class="block">
      <h3>本次提交的自动扣分</h3>
      <div class="score-big">系统评分 <b>{$submission.auto.score}</b> 分</div>
      {#if $submission.auto.deductions.length === 0}
        <p class="ok">✓ 未发现重叠、越界或悬空问题</p>
      {:else}
        <ul class="issues">
          {#each $submission.auto.deductions as d}
            <li><span class="dot {d.code}"></span>
              <span><b>-{d.points}分</b> {d.text}</span>
            </li>
          {/each}
        </ul>
      {/if}
      <button on:click={() => loadSubmissionToCanvas($submission)}>在画布中回看该布置</button>
      {#if $submission.status === 'reviewed'}
        <div class="reviewed">
          老师复核成绩：<b>{$submission.teacherScore}</b> 分
          {#if $submission.teacherComment}<p>{$submission.teacherComment}</p>{/if}
        </div>
      {:else}
        <p class="muted small">状态：待老师复核</p>
      {/if}
    </section>
  {/if}
</div>

<style>
  .asg { padding: 10px; overflow-y: auto; flex: 1; }
  .block { border-bottom: 1px solid var(--line); padding-bottom: 12px; margin-bottom: 12px; }
  h3 { margin: 4px 0 8px; font-size: 13px; }
  .full { display: block; margin-bottom: 8px; }
  .full input, .full textarea { width: 100%; margin-top: 4px; }
  textarea { resize: vertical; font: inherit; }
  .muted { color: var(--muted); }
  .small { font-size: 11px; }
  .req-row { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; }
  .row-between { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
  .full-btn { width: 100%; margin-top: 8px; }
  .asg-card { background: #f7f9fc; border-radius: 8px; padding: 8px 10px; line-height: 1.9; }
  .tag { margin-right: 4px; }
  .note { color: var(--warn); font-size: 12px; }
  .score-big { font-size: 15px; margin-bottom: 8px; }
  .score-big b { color: var(--brand); font-size: 22px; }
  .ok { color: var(--ok); font-weight: 600; }
  .issues { list-style: none; padding: 0; margin: 0 0 8px; }
  .issues li { display: flex; gap: 6px; padding: 4px 0; font-size: 12px; align-items: flex-start; }
  .dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex: none; }
  .dot.overlap, .dot.bounds, .dot.missing { background: var(--danger); }
  .dot.floating { background: var(--warn); }
  .reviewed { margin-top: 10px; padding: 8px 10px; background: #e4f3e5; border-radius: 8px; }
</style>
