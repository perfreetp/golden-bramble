import { useStore } from './store';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import MapView from './components/MapView';

export default function App() {
  const role = useStore((s) => s.role);
  const setRole = useStore((s) => s.setRole);
  const students = useStore((s) => s.students);
  const currentStudentId = useStore((s) => s.currentStudentId);
  const setCurrentStudent = useStore((s) => s.setCurrentStudent);
  const resetDemo = useStore((s) => s.resetDemo);
  const totalFeatures = useStore((s) => s.features.length);

  return (
    <div className="app">
      <header className="topbar">
        <h1>驾校训练场分层平面图与科目教学系统</h1>
        <span className="chip">
          要素总量 <b>{totalFeatures.toLocaleString()}</b> 条 · 五层管理 · 网格视口渲染
        </span>
        <div className="spacer" />
        {role === 'student' && (
          <select value={currentStudentId} onChange={(e) => setCurrentStudent(e.target.value)}>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}({s.classNo})</option>
            ))}
          </select>
        )}
        <div className="role-switch">
          <button className={role === 'coach' ? 'active' : ''} onClick={() => setRole('coach')}>教练端</button>
          <button className={role === 'student' ? 'active' : ''} onClick={() => setRole('student')}>学员端</button>
        </div>
        <button className="danger" onClick={() => {
          if (window.confirm('确认重置全部演示数据(任务、提交、覆盖项)?')) resetDemo();
        }}>
          重置数据
        </button>
      </header>

      <div className="main">
        <LeftPanel />
        <MapView />
        <RightPanel />
      </div>
    </div>
  );
}
