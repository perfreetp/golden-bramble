import React, { useEffect, useState } from 'react'
import { dbGetAll, dbPut, dbDelete, dbSeedIfEmpty } from '../lib/store'
import { seedAssignments } from '../lib/project'
import { autoGrade, mergeFinalScore, buildReport, TASK_PROFILES } from '../lib/grading'
import { exportProjectFile } from '../lib/exporter'
import { uid } from '../lib/geometry'

const ROLE_KEY = 'vet_lab_role'

export default function TeachingCenter({ currentProject, onLoadProject }) {
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY) || 'student')
  const [tab, setTab] = useState('tasks')
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [studentName, setStudentName] = useState(() => localStorage.getItem('vet_lab_name') || '学员小张')
  const [report, setReport] = useState(null)

  useEffect(() => {
    localStorage.setItem(ROLE_KEY, role)
  }, [role])
  useEffect(() => {
    localStorage.setItem('vet_lab_name', studentName)
  }, [studentName])

  const refresh = async () => {
    await dbSeedIfEmpty('assignments', seedAssignments())
    setAssignments(await dbGetAll('assignments'))
    setSubmissions(await dbGetAll('submissions'))
  }
  useEffect(() => { refresh() }, [])

  const submit = async (assignment) => {
    if (!currentProject.parts.length) return alert('当前工程为空，无法提交')
    const result = autoGrade(currentProject, assignment)
    const sub = {
      id: uid('sub'),
      assignmentId: assignment.id,
      taskType: assignment.taskType,
      studentName,
      project: JSON.parse(JSON.stringify(currentProject)),
      autoScore: result.autoScore,
      teacherScore: null,
      finalScore: null,
      teacherComment: '',
      status: 'pending',
      deductions: result.deductions,
      durationSec: result.durationSec,
      frameCount: result.frameCount,
      checkedFrames: result.checkedFrames,
      violatedFrames: result.violatedFrames,
      submittedAt: Date.now(),
    }
    await dbPut('submissions', sub)
    await refresh()
    setTab('submissions')
    alert(`提交成功！自动评分：${result.autoScore} 分（占总成绩 60%），等待老师复核`)
  }

  const review = async (sub, teacherScore, comment) => {
    const next = {
      ...sub,
      teacherScore,
      teacherComment: comment,
      finalScore: mergeFinalScore(sub.autoScore, teacherScore),
      status: 'reviewed',
      reviewedAt: Date.now(),
    }
    await dbPut('submissions', next)
    await refresh()
  }

  const openReport = async () => {
    setReport(buildReport(await dbGetAll('submissions'), await dbGetAll('assignments')))
    setTab('report')
  }

  return (
    <div className="teaching-center">
      <div className="teach-head">
        <div className="role-switch">
          <button className={role === 'student' ? 'btn primary' : 'btn ghost'} onClick={() => setRole('student')}>学员端</button>
          <button className={role === 'teacher' ? 'btn primary' : 'btn ghost'} onClick={() => setRole('teacher')}>老师端</button>
        </div>
        <div className="teach-tabs">
          <button className={tab === 'tasks' ? 'tab active' : 'tab'} onClick={() => setTab('tasks')}>动作任务</button>
          <button className={tab === 'submissions' ? 'tab active' : 'tab'} onClick={() => setTab('submissions')}>
            提交记录{submissions.length ? `（${submissions.length}）` : ''}
          </button>
          <button className={tab === 'report' ? 'tab active' : 'tab'} onClick={openReport}>成绩单</button>
        </div>
        {role === 'student' && (
          <label className="name-input">学员姓名
            <input value={studentName} onChange={(e) => setStudentName(e.target.value)} />
          </label>
        )}
      </div>

      {tab === 'tasks' && (
        <div className="task-grid">
          {assignments.map((a) => (
            <div key={a.id} className="task-card">
              <div className="task-type">{TASK_PROFILES[a.taskType]?.label}</div>
              <h4>{a.title}</h4>
              <p>{a.description}</p>
              <div className="task-meta">要求时长：{a.requiredDurationSec}s · 自动评分占 60%</div>
              {role === 'student' ? (
                <div className="btn-row">
                  <button className="btn primary" onClick={() => submit(a)}>提交当前动画</button>
                </div>
              ) : (
                <button className="btn ghost danger" onClick={async () => {
                  if (confirm('删除该任务？相关提交不会自动删除')) {
                    await dbDelete('assignments', a.id)
                    refresh()
                  }
                }}>删除任务</button>
              )}
            </div>
          ))}
          {role === 'teacher' && <CreateAssignment onCreate={refresh} />}
        </div>
      )}

      {tab === 'submissions' && (
        <SubmissionList
          submissions={submissions}
          assignments={assignments}
          role={role}
          onReview={review}
          onLoad={(sub) => {
            onLoadProject(sub.project)
            alert('已把该提交的工程载入编辑器')
          }}
          onExport={(sub) => exportProjectFile(sub.project)}
          onDelete={async (id) => {
            if (confirm('删除该提交记录？')) {
              await dbDelete('submissions', id)
              refresh()
            }
          }}
        />
      )}

      {tab === 'report' && report && <Report report={report} />}
    </div>
  )
}

function CreateAssignment({ onCreate }) {
  const [title, setTitle] = useState('')
  const [taskType, setTaskType] = useState('restraint')
  const [duration, setDuration] = useState(4)
  const [description, setDescription] = useState('')

  const save = async () => {
    if (!title.trim()) return alert('请填写任务标题')
    await dbPut('assignments', {
      id: uid('asn'), title, taskType, description,
      requiredDurationSec: Math.max(1, +duration || 4),
      createdAt: Date.now(),
    })
    setTitle('')
    setDescription('')
    onCreate()
  }

  return (
    <div className="task-card create-card">
      <h4>＋ 布置新动作任务</h4>
      <label className="field small"><span>标题</span><input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <label className="field small"><span>动作类型</span>
        <select value={taskType} onChange={(e) => setTaskType(e.target.value)}>
          {Object.entries(TASK_PROFILES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </label>
      <label className="field small"><span>要求时长（秒）</span>
        <input type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} />
      </label>
      <label className="field small"><span>任务说明</span>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <button className="btn primary" onClick={save}>发布任务</button>
    </div>
  )
}

function SubmissionList({ submissions, assignments, role, onReview, onLoad, onExport, onDelete }) {
  const [reviewing, setReviewing] = useState(null)
  const [score, setScore] = useState(80)
  const [comment, setComment] = useState('')
  const taskMap = new Map(assignments.map((a) => [a.id, a]))

  if (!submissions.length) return <div className="empty-tip big">暂无提交记录</div>

  return (
    <div className="sub-list">
      {submissions.map((s) => (
        <div key={s.id} className={`sub-card status-${s.status}`}>
          <div className="sub-head">
            <span className="task-type">{TASK_PROFILES[s.taskType]?.label}</span>
            <strong>{taskMap.get(s.assignmentId)?.title || '（任务已删除）'}</strong>
            <span className="sub-meta">{s.studentName} · {new Date(s.submittedAt).toLocaleString()}</span>
            <span className={`status-pill ${s.status}`}>
              {s.status === 'pending' ? '待复核' : '已复核'}
            </span>
          </div>
          <div className="sub-scores">
            <div>自动评分 <b>{s.autoScore}</b><small>/100（60%）</small></div>
            <div>老师评分 <b>{s.teacherScore ?? '—'}</b><small>/100（40%）</small></div>
            <div className="final">最终 <b>{s.finalScore ?? '—'}</b><small>/100</small></div>
            <div>时长 {s.durationSec}s（{s.frameCount} 帧）· 限角违规抽检 {s.violatedFrames}/{s.checkedFrames}</div>
          </div>
          <div className="deduction-list">
            {s.deductions.length === 0 && <div className="ok-line">自动评分未发现扣分项</div>}
            {s.deductions.map((d, i) => (
              <div key={i} className="deduction-item">
                <span className="penalty">-{d.penalty}</span>
                <div><b>{d.label}</b><p>{d.detail}</p></div>
              </div>
            ))}
          </div>
          {s.teacherComment && <div className="teacher-comment">老师评语：{s.teacherComment}</div>}
          <div className="btn-row">
            <button className="btn ghost" onClick={() => onLoad(s)}>载入工程查看</button>
            <button className="btn ghost" onClick={() => onExport(s)}>导出工程文件</button>
            {role === 'teacher' && (
              s.status === 'pending' ? (
                <button className="btn primary" onClick={() => { setReviewing(s.id); setScore(s.autoScore); setComment('') }}>
                  复核打分
                </button>
              ) : (
                <button className="btn ghost" onClick={() => { setReviewing(s.id); setScore(s.teacherScore); setComment(s.teacherComment) }}>
                  修改复核
                </button>
              )
            )}
            {role === 'teacher' && <button className="btn ghost danger" onClick={() => onDelete(s.id)}>删除</button>}
          </div>

          {reviewing === s.id && (
            <div className="review-box">
              <label className="field small"><span>老师评分（0–100）</span>
                <input type="number" min={0} max={100} value={score}
                  onChange={(e) => setScore(Math.min(100, Math.max(0, +e.target.value || 0)))} />
              </label>
              <label className="field small"><span>评语</span>
                <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)}
                  placeholder="指出动作亮点与改进点…" />
              </label>
              <div className="preview-final">
                合并后最终成绩：<b>{mergeFinalScore(s.autoScore, score)}</b> 分
                （自动 {s.autoScore}×60% + 老师 {score}×40%）
              </div>
              <div className="btn-row">
                <button className="btn primary" onClick={() => {
                  onReview(s, score, comment)
                  setReviewing(null)
                }}>确认复核</button>
                <button className="btn ghost" onClick={() => setReviewing(null)}>取消</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function Report({ report }) {
  return (
    <div className="report">
      <div className="report-summary">
        <div className="stat"><b>{report.submissionCount}</b><span>提交总数</span></div>
        <div className="stat"><b>{report.studentCount}</b><span>参与学员</span></div>
        <div className="stat"><b>{report.reviewedCount}</b><span>已复核</span></div>
      </div>

      <h4>各动作扣分点汇总</h4>
      <div className="report-actions">
        {report.actions.length === 0 && <div className="empty-tip big">暂无数据</div>}
        {report.actions.map((a) => (
          <div key={a.taskType} className="report-action-card">
            <div className="ra-head">
              <strong>{a.label}</strong>
              <span>{a.count} 份 · 自动均分 {a.avgAuto ?? '—'} · 最终均分 {a.avgFinal ?? '—'}</span>
            </div>
            {a.points.length === 0 && <div className="ok-line">该动作暂无扣分点</div>}
            <table className="points-table">
              <thead><tr><th>扣分点</th><th>出现次数</th><th>累计扣分</th><th>典型问题</th></tr></thead>
              <tbody>
                {a.points.map((p) => (
                  <tr key={p.label}>
                    <td>{p.label}</td>
                    <td>{p.count}</td>
                    <td>{p.totalPenalty}</td>
                    <td className="example">{p.examples[0] || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <h4>高频错题（跨动作）</h4>
      {report.commonErrors.length === 0 ? <div className="ok-line">全部提交均无错题</div> : (
        <div className="error-freq">
          {report.commonErrors.map((e) => (
            <div key={e.code} className="freq-chip">
              {e.label} <b>×{e.count}</b>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
