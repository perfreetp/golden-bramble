import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { wrongItems, effectiveScore, submissionTotal, type GradeResult } from '../lib/grading';
import { gradeSubmission } from '../lib/grading';
import { exportTranscript, exportStudentReport } from '../lib/exportCsv';
import { LAYER_MAP } from '../types';

export default function GradingPanel() {
  const role = useStore((s) => s.role);
  return role === 'coach' ? <CoachGrading /> : <StudentGrading />;
}

// ---------------- 学员端 ----------------
function StudentGrading() {
  const tasks = useStore((s) => s.tasks);
  const students = useStore((s) => s.students);
  const currentStudentId = useStore((s) => s.currentStudentId);
  const submissions = useStore((s) => s.submissions);
  const workingPlacements = useStore((s) => s.workingPlacements);
  const placementMode = useStore((s) => s.placementMode);
  const setPlacementMode = useStore((s) => s.setPlacementMode);
  const submitForTask = useStore((s) => s.submitForTask);
  const setActiveSubmission = useStore((s) => s.setActiveSubmission);
  const activeSubmissionId = useStore((s) => s.activeSubmissionId);
  const clearPlacements = useStore((s) => s.clearPlacements);
  const [taskId, setTaskId] = useState('');
  const [msg, setMsg] = useState('');

  const stu = students.find((x) => x.id === currentStudentId)!;
  const mine = submissions.filter((s) => s.student === currentStudentId);
  const activeTask = tasks.find((t) => t.id === taskId);

  // 实时预估:未提交前根据当前摆放实时给出预估偏差与分数
  const preview: GradeResult | null = useMemo(() => {
    if (!activeTask || workingPlacements.length === 0) return null;
    return gradeSubmission(activeTask, workingPlacements, useStore.getState().featureMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTask, workingPlacements]);

  const doSubmit = () => {
    if (!activeTask) {
      setMsg('请先选择要完成的任务');
      return;
    }
    const sub = submitForTask(activeTask.id);
    if (sub) {
      setMsg(`已提交,系统初步评分 ${sub.autoTotal} 分,等待教练复核`);
      setActiveSubmission(sub.id);
    }
  };

  return (
    <div className="section">
      <h3>我的作业 <span className="count">{stu.name} · {stu.classNo}</span></h3>

      <div className="form-row">
        <label>选择任务</label>
        <select value={taskId} onChange={(e) => { setTaskId(e.target.value); setMsg(''); }}>
          <option value="">— 请选择 —</option>
          {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}({t.subject})</option>)}
        </select>
      </div>

      {activeTask && (
        <div className="card">
          <div className="title">{activeTask.title}</div>
          <div className="req">{activeTask.requirement}</div>
          <div className="ref-chips">
            <span className="tag pile">目标桩位 {activeTask.pileIds.length}</span>
            <span className="tag lane">目标车道 {activeTask.laneIds.length}</span>
          </div>
          <div className="btn-row">
            {!placementMode ? (
              <button className="primary" onClick={() => setPlacementMode(true)}>开始摆放</button>
            ) : (
              <button onClick={() => setPlacementMode(false)}>暂停摆放</button>
            )}
            <button onClick={clearPlacements}>清空</button>
            <button className="primary" onClick={doSubmit}>提交作业</button>
          </div>
          <div className="hint">
            摆放方式:在右侧「属性」页选中目标要素 → 进入摆放模式 → 在地图上点击目标位置。
            已摆放 {workingPlacements.length} / {activeTask.pileIds.length + activeTask.laneIds.length} 项
          </div>
          {preview && (
            <div style={{ marginTop: 8 }}>
              <div className="muted">提交前实时预估</div>
              <div className="score-big auto">{preview.total} 分</div>
              <div className="muted">缺项 {preview.missing.length} 个 · 偏差超 0.3m 的错题 {wrongItemsOf(preview)} 个</div>
            </div>
          )}
        </div>
      )}
      {msg && <div className="hint" style={{ color: 'var(--ok)' }}>{msg}</div>}

      <h3 style={{ marginTop: 16 }}>我的提交记录</h3>
      {mine.length === 0 && <div className="empty">还没有提交记录</div>}
      {mine.map((s) => {
        const t = tasks.find((x) => x.id === s.taskId);
        return (
          <div
            className="card"
            key={s.id}
            style={{ cursor: 'pointer', outline: activeSubmissionId === s.id ? '1px solid var(--accent)' : undefined }}
            onClick={() => setActiveSubmission(activeSubmissionId === s.id ? null : s.id)}
          >
            <div className="title">{t?.title ?? s.taskId}</div>
            <div className="meta">{new Date(s.submittedAt).toLocaleString('zh-CN')}</div>
            <div>
              <span className={s.reviewed ? 'tag ok' : 'tag wait'}>{s.reviewed ? '已复核' : '待复核'}</span>
              <span className="muted">
                系统 {s.autoTotal} 分{s.reviewed ? ` · 最终 ${submissionTotal(s)} 分` : ''}
              </span>
            </div>
            {s.reviewed && s.reviewComment && <div className="req">教练评语:{s.reviewComment}</div>}
          </div>
        );
      })}
    </div>
  );
}

function wrongItemsOf(g: GradeResult): number {
  return g.items.filter((i) => i.deviation > 0.3 || i.autoScore === 0).length;
}

// ---------------- 教练端 ----------------
function CoachGrading() {
  const submissions = useStore((s) => s.submissions);
  const students = useStore((s) => s.students);
  const tasks = useStore((s) => s.tasks);
  const featureMap = useStore((s) => s.featureMap);
  const activeSubmissionId = useStore((s) => s.activeSubmissionId);
  const setActiveSubmission = useStore((s) => s.setActiveSubmission);
  const setItemScore = useStore((s) => s.setItemScore);
  const finishReview = useStore((s) => s.finishReview);

  const [comment, setComment] = useState('');

  const active = submissions.find((s) => s.id === activeSubmissionId) ?? null;
  const activeStu = active ? students.find((x) => x.id === active.student) : null;
  const activeTask = active ? tasks.find((t) => t.id === active.taskId) : null;

  const allItems = active ? [...active.pileScores, ...active.laneScores] : [];

  return (
    <div className="section">
      <h3>作业复核与成绩</h3>
      <div className="btn-row" style={{ marginBottom: 10 }}>
        <button onClick={() => exportTranscript(students, submissions, tasks)}>导出全员成绩单</button>
      </div>

      {submissions.length === 0 && <div className="empty">暂无学员提交</div>}
      <div className="sel-list" style={{ maxHeight: 200, marginBottom: 10 }}>
        {submissions.map((s) => {
          const stu = students.find((x) => x.id === s.student);
          const t = tasks.find((x) => x.id === s.taskId);
          return (
            <div
              className="item"
              key={s.id}
              style={{ cursor: 'pointer', background: activeSubmissionId === s.id ? '#1e3a5f' : undefined }}
              onClick={() => { setActiveSubmission(s.id); setComment(s.reviewComment); }}
            >
              <span>{stu?.name} · {t?.title ?? s.taskId}</span>
              <span>
                <span className={s.reviewed ? 'tag ok' : 'tag wait'}>{s.reviewed ? '已复核' : '待复核'}</span>
                <span className="muted">{submissionTotal(s)} 分</span>
              </span>
            </div>
          );
        })}
      </div>

      {active && (
        <>
          <div className="card">
            <div className="title">
              {activeStu?.name}({activeStu?.classNo}) — {activeTask?.title}
            </div>
            <div className="meta">
              提交时间 {new Date(active.submittedAt).toLocaleString('zh-CN')} ·
              摆放 {active.placements.length} 项 · 错题 {wrongItems(active).length} 个
            </div>
            <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', margin: '6px 0' }}>
              <div>
                <div className="muted">系统初步分</div>
                <div className="score-big auto">{active.autoTotal}</div>
              </div>
              <div>
                <div className="muted">复核总分</div>
                <div className="score-big final">{active.finalTotal ?? '—'}</div>
              </div>
            </div>
          </div>

          <ScoreTable
            title="桩位评分(权重 60%)"
            items={active.pileScores}
            disabled={active.reviewed}
            onSet={(fid, score, c) => setItemScore(active.id, fid, score, c)}
          />
          <ScoreTable
            title="车道评分(权重 40%)"
            items={active.laneScores}
            disabled={active.reviewed}
            onSet={(fid, score, c) => setItemScore(active.id, fid, score, c)}
          />

          <div className="form-row" style={{ marginTop: 10 }}>
            <label>复核评语</label>
            <textarea value={comment} disabled={active.reviewed} onChange={(e) => setComment(e.target.value)} />
          </div>
          {!active.reviewed ? (
            <div className="btn-row">
              <button
                className="primary"
                onClick={() => finishReview(active.id, comment || '已完成复核,注意错题清单中的偏差点位。')}
              >
                确认复核并出分
              </button>
            </div>
          ) : (
            <div className="btn-row">
              <button onClick={() => exportStudentReport(activeStu!, submissions.filter((x) => x.student === active.student), tasks, featureMap)}>
                导出 {activeStu?.name} 的成绩单与错题清单
              </button>
            </div>
          )}
          <div className="hint" style={{ marginTop: 8 }}>
            评分规则:偏差 ≤0.15m 满分;≤0.3m 得 90;≤0.5m 得 75;≤1.0m 得 55;更大偏差继续扣分;缺项记 0。
            复核时可直接改分,留空则采用系统分。共 {allItems.length} 个评分点。
          </div>
        </>
      )}
    </div>
  );
}

function ScoreTable(props: {
  title: string;
  items: { featureId: string; name: string; layer: keyof typeof LAYER_MAP; deviation: number; autoScore: number; finalScore: number | null; comment: string }[];
  disabled: boolean;
  onSet: (featureId: string, score: number | null, comment: string) => void;
}) {
  const [editing, setEditing] = useState<Record<string, string>>({});
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="muted" style={{ margin: '8px 0 4px' }}>{props.title}</div>
      <table className="score">
        <thead>
          <tr>
            <th>编号</th><th>要素</th><th>偏差(m)</th><th>系统分</th><th>复核分</th><th>当前</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((i) => (
            <tr key={i.featureId}>
              <td>{i.featureId}</td>
              <td className="name" title={i.name}>{i.name}</td>
              <td style={{ color: i.deviation > 0.3 ? 'var(--bad)' : i.deviation > 0.15 ? 'var(--warn)' : 'var(--ok)' }}>
                {Number.isFinite(i.deviation) ? i.deviation.toFixed(2) : '缺项'}
              </td>
              <td>{i.autoScore}</td>
              <td>
                <input
                  disabled={props.disabled}
                  value={editing[i.featureId] ?? (i.finalScore ?? '')}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9]/g, '');
                    setEditing((m) => ({ ...m, [i.featureId]: v }));
                    const n = v === '' ? null : Math.max(0, Math.min(100, Number(v)));
                    props.onSet(i.featureId, n, n === null ? i.comment : n >= i.autoScore ? '复核加分' : '复核扣分,需加强练习');
                  }}
                />
              </td>
              <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{effectiveScore(i)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
