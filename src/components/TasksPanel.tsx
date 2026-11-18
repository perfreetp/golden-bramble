import { useState } from 'react';
import { useStore } from '../store';

const SUBJECTS = ['倒车入库', '侧方停车', '曲线行驶', '直角转弯', '坡道定点停车与起步', '综合训练'];

export default function TasksPanel() {
  const role = useStore((s) => s.role);
  const tasks = useStore((s) => s.tasks);
  const taskDraft = useStore((s) => s.taskDraft);
  const startTaskDraft = useStore((s) => s.startTaskDraft);
  const cancelTaskDraft = useStore((s) => s.cancelTaskDraft);
  const removeDraftRef = useStore((s) => s.removeDraftRef);
  const createTask = useStore((s) => s.createTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const featureMap = useStore((s) => s.featureMap);
  const setSelected = useStore((s) => s.setSelected);
  const searchAndLocate = useStore((s) => s.searchAndLocate);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [requirement, setRequirement] = useState('');
  const [err, setErr] = useState('');

  if (role !== 'coach') {
    return (
      <div className="section">
        <h3>科目任务</h3>
        <div className="empty">任务发布为教练功能,请在顶栏切换到教练角色。</div>
      </div>
    );
  }

  const publish = () => {
    if (!title.trim()) {
      setErr('请填写任务标题');
      return;
    }
    const t = createTask(title.trim(), subject, requirement.trim() || '按图示点位完成摆放,偏差不超过 0.3m。');
    if (!t) {
      setErr('请先用 Shift 套索圈选至少一个桩位或车道要素');
      return;
    }
    setErr('');
    setTitle('');
    setRequirement('');
  };

  return (
    <div className="section">
      <h3>科目任务 <span className="count">已发布 {tasks.length} 个</span></h3>

      {!taskDraft ? (
        <button className="primary" onClick={startTaskDraft}>＋ 新建任务(圈选桩位与车道)</button>
      ) : (
        <div className="card">
          <div className="title">任务圈选进行中</div>
          <div className="meta">在地图上按住 Shift 拖动鼠标套索圈选;也可框选后点「加入任务」</div>
          <div className="ref-chips">
            <span className="tag pile">桩位 {taskDraft.pileIds.length}</span>
            <span className="tag lane">车道 {taskDraft.laneIds.length}</span>
          </div>
          <div className="sel-list" style={{ maxHeight: 180 }}>
            {[...taskDraft.pileIds, ...taskDraft.laneIds].map((id) => (
              <div className="item" key={id}>
                <span>{id}</span>
                <span>
                  <span className="muted">{featureMap.get(id)?.name}</span>
                  <button style={{ marginLeft: 6 }} onClick={() => removeDraftRef(id)}>✕</button>
                </span>
              </div>
            ))}
          </div>
          <div className="form-row" style={{ marginTop: 8 }}>
            <label>任务标题</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例:第 3 训练区倒车入库点位摆放" />
          </div>
          <div className="form-row">
            <label>科目</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              {SUBJECTS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>教学要求</label>
            <textarea value={requirement} onChange={(e) => setRequirement(e.target.value)} placeholder="填写点位精度、完成时限、操作要点等要求" />
          </div>
          {err && <div className="hint" style={{ color: 'var(--warn)' }}>{err}</div>}
          <div className="btn-row" style={{ marginTop: 8 }}>
            <button className="primary" onClick={publish}>发布任务</button>
            <button onClick={cancelTaskDraft}>取消</button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        {tasks.length === 0 && <div className="empty">暂无任务</div>}
        {tasks.map((t) => (
          <div className="card" key={t.id}>
            <div className="title">{t.title}</div>
            <div className="meta">
              {t.id} · {t.subject} · {t.creator} · {new Date(t.createdAt).toLocaleString('zh-CN')}
            </div>
            <div className="req">{t.requirement}</div>
            <div className="ref-chips">
              <span className="tag pile">桩位 {t.pileIds.length}</span>
              <span className="tag lane">车道 {t.laneIds.length}</span>
            </div>
            <div className="btn-row">
              <button
                onClick={() => {
                  setSelected([...t.pileIds, ...t.laneIds]);
                  const first = t.pileIds[0] ?? t.laneIds[0];
                  if (first) searchAndLocate(first);
                }}
              >
                在图上定位
              </button>
              <button className="danger" onClick={() => deleteTask(t.id)}>删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
