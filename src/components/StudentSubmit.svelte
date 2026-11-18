<script lang="ts">
  import { fieldStore, submitPlan, currentProblemId } from '../lib/stores';
  import { summarizeFailures } from '../lib/evaluation';
  import type { AutoEvaluation, RobotPlan } from '../lib/types';

  let studentName = '';
  let teamName = '';
  let plan: RobotPlan = {
    maxClimbHeight: 150,
    maxIncline: 20,
    minChannelWidth: 450,
    wheelRadius: 100,
    baseWidth: 400,
    baseLength: 600,
    notes: '',
  };
  let result: AutoEvaluation | null = null;

  function submit() {
    if (!studentName.trim() || !teamName.trim()) {
      alert('请填写学员姓名与参赛队名称');
      return;
    }
    const sub = submitPlan(studentName.trim(), teamName.trim(), { ...plan });
    result = sub.evaluation;
  }

  $: failures = result ? summarizeFailures(result.checks) : [];
</script>

<div class="assess">
  <div class="form-card">
    <h3>学员方案提交</h3>
    <p class="muted small">
      当前题目：{$currentProblemId ?? '未保存题目（仍可提交练习）'} ·
      场地 {$fieldStore.units.length} 个障碍单元 · 种子 {$fieldStore.config.seed}
    </p>
    <div class="row">
      <div class="field">
        <label>学员姓名</label>
        <input bind:value={studentName} placeholder="张三" />
      </div>
      <div class="field">
        <label>参赛队</label>
        <input bind:value={teamName} placeholder="先锋一队" />
      </div>
    </div>
    <div class="row">
      <div class="field">
        <label>最大越障高度 (mm)</label>
        <input type="number" bind:value={plan.maxClimbHeight} />
      </div>
      <div class="field">
        <label>最大爬坡角 (°)</label>
        <input type="number" bind:value={plan.maxIncline} />
      </div>
      <div class="field">
        <label>最小通道宽度 (mm)</label>
        <input type="number" bind:value={plan.minChannelWidth} />
      </div>
    </div>
    <div class="row">
      <div class="field">
        <label>轮半径 (mm)</label>
        <input type="number" bind:value={plan.wheelRadius} />
      </div>
      <div class="field">
        <label>车体宽 (mm)</label>
        <input type="number" bind:value={plan.baseWidth} />
      </div>
      <div class="field">
        <label>车体长 (mm)</label>
        <input type="number" bind:value={plan.baseLength} />
      </div>
    </div>
    <div class="field">
      <label>方案说明</label>
      <textarea rows="2" bind:value={plan.notes} placeholder="行走机构、传感器、通过策略……"></textarea>
    </div>
    <button class="primary" on:click={submit}>提交并自动判分（70 分）</button>
  </div>

  {#if result}
    <div class="result-card">
      <h3>自动判分结果</h3>
      <div class="score-line">
        <span class="big-score">{result.autoScore}</span> / 70 分，
        通过 {result.passedCount}/{result.totalCount} 项检查
      </div>
      <table>
        <thead>
          <tr><th>检查项</th><th>结论</th><th>判据明细</th></tr>
        </thead>
        <tbody>
          {#each result.checks as c}
            <tr>
              <td>{c.unitId.includes('↔') ? '全场通道' : c.unitId}</td>
              <td>
                <span class="tag {c.passed ? 'ok' : 'bad'}">{c.passed ? '通过' : '不通过'}</span>
              </td>
              <td>{c.detail}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      {#if failures.length > 0}
        <h3>错题汇总</h3>
        <div class="fail-tags">
          {#each failures as f}
            <span class="tag bad">{f.label} × {f.count}</span>
          {/each}
        </div>
      {/if}
      <p class="muted small">自动判分占 70 分（坡度/障碍高度/通道宽度），剩余 30 分由教师在「教师复核」页评定。</p>
    </div>
  {/if}
</div>

<style>
  .assess {
    padding: 16px;
    display: grid;
    grid-template-columns: minmax(320px, 420px) 1fr;
    gap: 16px;
    align-items: start;
  }
  .form-card,
  .result-card {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px;
  }
  .big-score {
    font-size: 30px;
    font-weight: bold;
    color: var(--accent-2);
  }
  .score-line {
    margin-bottom: 10px;
  }
  .fail-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }
  .small {
    font-size: 12px;
  }
  @media (max-width: 980px) {
    .assess {
      grid-template-columns: 1fr;
    }
  }
</style>
