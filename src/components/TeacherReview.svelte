<script lang="ts">
  import { submissionStore, reviewSubmission } from '../lib/stores';
  import { gradeBookCsv, downloadText } from '../lib/exporters';
  import { totalScore } from '../lib/evaluation';
  import { UNIT_LABELS, type Submission } from '../lib/types';

  let selectedId: string | null = null;
  let reviewScore = 20;
  let reviewComment = '';

  $: selected = $submissionStore.find((s) => s.id === selectedId) ?? null;

  function open(s: Submission) {
    selectedId = s.id;
    reviewScore = s.reviewScore ?? 20;
    reviewComment = s.reviewComment ?? '';
  }

  function saveReview() {
    if (!selected) return;
    reviewSubmission(selected.id, reviewScore, reviewComment);
  }

  function exportBook() {
    downloadText('成绩与错题汇总表.csv', gradeBookCsv($submissionStore));
  }

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  $: reviewedTotals = $submissionStore
    .map((s) => totalScore(s.evaluation.autoScore, s.reviewScore))
    .filter((v): v is number => v !== null);
  $: pending = $submissionStore.filter((s) => s.reviewScore === null).length;
</script>

<div class="review">
  <div class="book">
    <div class="head">
      <h3>成绩册（{$submissionStore.length} 份提交，{pending} 份待复核）</h3>
      <button on:click={exportBook} disabled={$submissionStore.length === 0}>导出成绩汇总 CSV</button>
    </div>
    {#if reviewedTotals.length > 0}
      <p class="muted small">已复核平均总分：{avg(reviewedTotals).toFixed(1)} / 100</p>
    {/if}
    <div class="scroll table-wrap">
      <table>
        <thead>
          <tr>
            <th>学员</th><th>参赛队</th><th>题目</th><th>自动(70)</th>
            <th>复核(30)</th><th>总分</th><th>错题</th><th>时间</th><th></th>
          </tr>
        </thead>
        <tbody>
          {#each $submissionStore as s (s.id)}
            <tr class:rowsel={s.id === selectedId}>
              <td>{s.studentName}</td>
              <td>{s.teamName}</td>
              <td>{s.problemId}</td>
              <td>{s.evaluation.autoScore}</td>
              <td>{s.reviewScore ?? '—'}</td>
              <td>
                {#if totalScore(s.evaluation.autoScore, s.reviewScore) !== null}
                  <b>{totalScore(s.evaluation.autoScore, s.reviewScore)}</b>
                {:else}
                  <span class="tag">待复核</span>
                {/if}
              </td>
              <td>{s.evaluation.totalCount - s.evaluation.passedCount} 项</td>
              <td class="small">{new Date(s.createdAt).toLocaleString('zh-CN')}</td>
              <td><button on:click={() => open(s)}>复核</button></td>
            </tr>
          {:else}
            <tr><td colspan="9" class="muted">暂无提交</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  {#if selected}
    <div class="detail">
      <h3>复核 — {selected.studentName}（{selected.teamName}）</h3>
      <div class="plan-grid">
        <div>越障高度 <b>{selected.plan.maxClimbHeight}mm</b></div>
        <div>爬坡角 <b>{selected.plan.maxIncline}°</b></div>
        <div>通道需求 <b>{selected.plan.minChannelWidth}mm</b></div>
        <div>轮半径 <b>{selected.plan.wheelRadius}mm</b></div>
        <div>车体 <b>{selected.plan.baseWidth}×{selected.plan.baseLength}mm</b></div>
      </div>
      {#if selected.plan.notes}<p class="muted small">方案说明：{selected.plan.notes}</p>{/if}

      <h3>自动判分明细（{selected.evaluation.autoScore}/70）</h3>
      <div class="checks scroll">
        {#each selected.evaluation.checks as c}
          <div class="check {c.passed ? 'ok' : 'bad'}">
            <span class="tag {c.passed ? 'ok' : 'bad'}">{c.passed ? '过' : '错'}</span>
            <span>{c.unitId.includes('↔') ? '全场通道' : `${UNIT_LABELS[c.unitType]} ${c.unitId}`}</span>
            <span class="muted small">{c.detail}</span>
          </div>
        {/each}
      </div>

      <div class="field">
        <label>教师复核得分（0~30，当前 {reviewScore}）</label>
        <input type="range" min={0} max={30} step={1} bind:value={reviewScore} />
      </div>
      <div class="field">
        <label>复核评语 / 错题讲解</label>
        <textarea rows="3" bind:value={reviewComment} placeholder="例如：梅花桩通道判断正确，但未考虑碎石地越障高度余量……"></textarea>
      </div>
      <button class="primary" on:click={saveReview}>保存复核（总分 {selected.evaluation.autoScore + reviewScore}）</button>
    </div>
  {/if}
</div>

<style>
  .review {
    padding: 16px;
    display: grid;
    grid-template-columns: 1fr minmax(320px, 420px);
    gap: 16px;
    align-items: start;
  }
  .book,
  .detail {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px;
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .head h3 {
    border: none;
    margin: 0;
  }
  .table-wrap {
    max-height: 65vh;
  }
  tr.rowsel {
    background: #243150;
  }
  .plan-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    font-size: 12px;
    background: var(--panel-2);
    border-radius: 6px;
    padding: 8px;
  }
  .plan-grid b {
    color: var(--accent-2);
  }
  .checks {
    max-height: 260px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 10px;
  }
  .check {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 8px;
    border-radius: 6px;
    background: var(--panel-2);
    border-left: 3px solid var(--border);
  }
  .check.ok {
    border-left-color: var(--ok);
  }
  .check.bad {
    border-left-color: var(--bad);
  }
  .small {
    font-size: 11px;
  }
  @media (max-width: 1100px) {
    .review {
      grid-template-columns: 1fr;
    }
  }
</style>
