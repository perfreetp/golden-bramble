<script>
  import { submissions, submission, instances, room } from '../lib/stores.js'
  import {
    reviewSubmission, deleteSubmission, loadSubmissionToCanvas, errorSummary
  } from '../lib/workflow.js'

  let scoreDraft = {}
  let commentDraft = {}

  $: summary = errorSummary($submissions)

  function load(rec) {
    loadSubmissionToCanvas(rec)
    scoreDraft[rec.id] = rec.teacherScore ?? rec.auto.score
    commentDraft[rec.id] = rec.teacherComment || ''
    scoreDraft = scoreDraft
    commentDraft = commentDraft
  }

  function saveReview(rec) {
    reviewSubmission(rec.id, scoreDraft[rec.id], commentDraft[rec.id])
  }
</script>

<div class="book">
  <section class="block">
    <h3>常见错误汇总（全部提交）</h3>
    {#if summary.length === 0}
      <p class="muted">暂无错误记录</p>
    {:else}
      <div class="err-grid">
        {#each summary as s (s.code)}
          <div class="err-cell">
            <b>{s.count}</b><span>{s.label}</span>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <section class="block grow">
    <h3>成绩与扣分项（共 {$submissions.length} 份）</h3>
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>学员</th><th>提交时间</th><th>器材</th>
            <th>系统分</th><th>老师分</th><th>状态</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          {#each $submissions as rec (rec.id)}
            <tr class:current={$submission?.id === rec.id}>
              <td>{rec.studentName}</td>
              <td class="small">{rec.submittedAt}</td>
              <td>{rec.instances.length}</td>
              <td><b class:red={rec.auto.score < 60}>{rec.auto.score}</b></td>
              <td>{rec.teacherScore ?? '—'}</td>
              <td>
                {#if rec.status === 'reviewed'}
                  <span class="tag green">已复核</span>
                {:else}
                  <span class="tag">待复核</span>
                {/if}
              </td>
              <td>
                <button on:click={() => load(rec)}>载入</button>
                <button class="danger" on:click={() => {
                  if (confirm('删除该提交记录？')) deleteSubmission(rec.id)
                }}>删</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  {#if $submission}
    <section class="block review">
      <h3>复核打分 — {$submission.studentName}</h3>
      <ul class="issues">
        {#each $submission.auto.deductions as d (d.text)}
          <li><span class="dot {d.code}"></span><b>-{d.points}分</b> {d.text}</li>
        {:else}
          <li class="ok">✓ 系统未发现扣分项</li>
        {/each}
      </ul>
      <div class="row">
        <label>老师评分
          <input type="number" min="0" max="100" bind:value={scoreDraft[$submission.id]}
            on:input={() => scoreDraft = scoreDraft} />
        </label>
      </div>
      <textarea rows="3" placeholder="复核评语…" bind:value={commentDraft[$submission.id]}
        on:input={() => commentDraft = commentDraft}></textarea>
      <button class="primary full-btn"
        on:click={() => saveReview($submission)}>保存复核成绩</button>
    </section>
  {/if}
</div>

<style>
  .book { padding: 10px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; }
  .block { border-bottom: 1px solid var(--line); padding-bottom: 12px; margin-bottom: 12px; }
  .block.grow { flex: 1; }
  h3 { margin: 4px 0 8px; font-size: 13px; }
  .muted { color: var(--muted); }
  .small { font-size: 11px; white-space: nowrap; }
  .err-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .err-cell { background: #fdecec; border-radius: 8px; padding: 8px; text-align: center; }
  .err-cell b { display: block; font-size: 20px; color: var(--danger); }
  .err-cell span { font-size: 11px; color: var(--muted); }
  .table-scroll { overflow-x: auto; }
  .red { color: var(--danger); }
  tr.current { background: var(--brand-soft); }
  .issues { list-style: none; padding: 0; margin: 0 0 8px; }
  .issues li { display: flex; gap: 6px; padding: 3px 0; font-size: 12px; align-items: flex-start; }
  .dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex: none; }
  .dot.overlap, .dot.bounds, .dot.missing { background: var(--danger); }
  .dot.floating { background: var(--warn); }
  .ok { color: var(--ok); }
  .row { margin-bottom: 8px; }
  textarea { width: 100%; font: inherit; border: 1px solid var(--line); border-radius: 6px; padding: 6px 8px; resize: vertical; }
  .full-btn { width: 100%; margin-top: 8px; }
</style>
