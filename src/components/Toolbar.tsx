// 顶部工具栏：工具切换、撤销重做、布尔、编组、文件与导出
import {
  canRedo,
  canUndo,
  createCompoundFromSelection,
  docState,
  duplicateSelected,
  deleteSelected,
  groupSelected,
  redo,
  revertToBaseline,
  setUi,
  uiState,
  undo,
  ungroupSelected,
} from '../store';
import type { ToolId } from '../types';

interface Props {
  onNewShape: (kind: 'starfish' | 'jellyfish' | 'wave') => void;
  onSave: () => void;
  onOpen: () => void;
  onNewFile: () => void;
  onExportSvg: () => void;
  onExportProofs: () => void;
  onCommitVersion: () => void;
}

const TOOLS: { id: ToolId; label: string; title: string }[] = [
  { id: 'select', label: '➤', title: '选择/移动 (V)' },
  { id: 'node', label: '✛', title: '节点编辑 (A)，拖锚点/控制柄，双击线段插入节点' },
  { id: 'pan', label: '✋', title: '平移画布 (H)' },
  { id: 'annotate', label: '✎', title: '审核圈选批注' },
];

export default function Toolbar(props: Props) {
  const pickTool = (id: ToolId) => setUi('tool', id);

  return (
    <div class="toolbar">
      <strong style={{ margin: '0 8px 0 0' }}>滑道喷涂模板</strong>
      <div class="tool-group">
        {TOOLS.map((t) => (
          <button
            class="icon-btn"
            classList={{ active: uiState.tool === t.id }}
            title={t.title}
            onClick={() => pickTool(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div class="divider" />
      <div class="tool-group">
        <button class="btn small" onClick={() => props.onNewShape('starfish')}>＋海星</button>
        <button class="btn small" onClick={() => props.onNewShape('jellyfish')}>＋水母</button>
        <button class="btn small" onClick={() => props.onNewShape('wave')}>＋浪花</button>
      </div>
      <div class="divider" />
      <div class="tool-group">
        <button class="icon-btn" title="撤销 Ctrl+Z" disabled={!canUndo()} onClick={undo}>↶</button>
        <button class="icon-btn" title="重做 Ctrl+Y" disabled={!canRedo()} onClick={redo}>↷</button>
        <button
          class="btn small"
          title="连续回退到打开文件时的状态"
          onClick={revertToBaseline}
        >
          回到打开时
        </button>
        <span class="hint">历史 {docState.past.length} 步</span>
      </div>
      <div class="divider" />
      <div class="tool-group">
        <button
          class="btn small"
          disabled={uiState.selection.length < 2}
          onClick={() => createCompoundFromSelection('union')}
          title="多选后求并集，结果保留源路径节点可继续调整"
        >
          并集 ∪
        </button>
        <button
          class="btn small"
          disabled={uiState.selection.length < 2}
          onClick={() => createCompoundFromSelection('subtract')}
          title="按选择顺序，首个图形减去其余图形"
        >
          差集 −
        </button>
        <button
          class="btn small"
          disabled={uiState.selection.length < 2}
          onClick={() => createCompoundFromSelection('intersect')}
        >
          交集 ∩
        </button>
      </div>
      <div class="divider" />
      <div class="tool-group">
        <button class="btn small" disabled={uiState.selection.length < 2} onClick={() => groupSelected()}>
          编组
        </button>
        <button class="btn small" onClick={ungroupSelected}>解组</button>
        <button class="btn small" onClick={duplicateSelected} disabled={!uiState.selection.length}>
          复制
        </button>
        <button class="btn small danger" onClick={deleteSelected} disabled={!uiState.selection.length}>
          删除
        </button>
      </div>
      <div class="divider" />
      <div class="tool-group">
        <button class="btn small" onClick={props.onCommitVersion}>提交新版本</button>
        <button class="btn small" onClick={props.onExportSvg}>导出SVG</button>
        <button class="btn small" onClick={props.onExportProofs}>分色打样</button>
      </div>
      <div class="divider" />
      <div class="tool-group">
        <button class="btn small" onClick={props.onOpen}>打开</button>
        <button class="btn small" onClick={props.onSave}>保存</button>
        <button class="btn small" onClick={props.onNewFile}>新建</button>
      </div>
    </div>
  );
}
