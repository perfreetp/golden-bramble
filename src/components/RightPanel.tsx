import { useState } from 'react';
import AttributesPanel from './AttributesPanel';
import TasksPanel from './TasksPanel';
import GradingPanel from './GradingPanel';

export default function RightPanel() {
  const [tab, setTab] = useState<'attr' | 'task' | 'grade'>('attr');
  return (
    <div className="panel right">
      <div className="tabs">
        <button className={tab === 'attr' ? 'active' : ''} onClick={() => setTab('attr')}>要素属性</button>
        <button className={tab === 'task' ? 'active' : ''} onClick={() => setTab('task')}>科目任务</button>
        <button className={tab === 'grade' ? 'active' : ''} onClick={() => setTab('grade')}>作业成绩</button>
      </div>
      {tab === 'attr' && <AttributesPanel />}
      {tab === 'task' && <TasksPanel />}
      {tab === 'grade' && <GradingPanel />}
    </div>
  );
}
