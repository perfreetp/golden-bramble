// 应用根组件：装配工具栏/画布/面板，处理快捷键、文件IO、批注模态、导出
import { createSignal, onCleanup, onMount } from 'solid-js';
import Toolbar from './Toolbar';
import CanvasView from './CanvasView';
import LayersPanel from './LayersPanel';
import SidePanel from './SidePanel';
import Modal from './Modal';
import ProofModal from './ProofModal';
import {
  addAnnotation,
  addShape,
  commitVersion,
  deleteSelected,
  docState,
  exportProjectFile,
  insertNodeOnSegment,
  newFile,
  openFile,
  redo,
  saveFile,
  scheduleAutosave,
  setUi,
  uiState,
  undo,
} from '../store';
import { createShapePath, DEFAULT_STYLE } from '../lib/shape-factory';
import { buildSvg, downloadSvg } from '../lib/exporters';
import { downloadJson } from '../lib/storage';
import type { PathData, SprayDoc, ToolId } from '../types';

type ModalKind =
  | { kind: 'none' }
  | { kind: 'annotation'; loop: PathData }
  | { kind: 'proof' }
  | { kind: 'version-note' };

export default function App() {
  const [modal, setModal] = createSignal<ModalKind>({ kind: 'none' });
  const [annoText, setAnnoText] = createSignal('');
  const [toast, setToast] = createSignal('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  // ---------- 图形创建 ----------
  const handleNewShape = (kind: 'starfish' | 'jellyfish' | 'wave') => {
    const path = createShapePath(kind);
    // 放到当前视口中心附近，并按已有图形数量错位，避免新建图形完全重叠
    const view = uiState.view;
    const host = document.querySelector('.canvas-wrap')?.getBoundingClientRect();
    const baseX = host ? (host.width / 2 - view.tx) / view.scale : 300;
    const baseY = host ? (host.height / 2 - view.ty) / view.scale : 260;
    const n = docState.doc.nodes.length;
    const offset = (n % 6) * 36;
    addShape(kind, path, { ...DEFAULT_STYLE }, { x: baseX + offset - 90, y: baseY + offset - 60 });
    setUi('tool', 'select');
    scheduleAutosave();
  };

  // ---------- 文件 ----------
  const handleSave = () => {
    saveFile();
    const payload = exportProjectFile();
    downloadJson(`${docState.fileName.replace(/\s+/g, '_')}.spray.json`, payload);
    showToast('已保存并下载项目文件');
  };

  const handleOpen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result)) as {
            fileName: string;
            doc: SprayDoc;
            baseline?: SprayDoc;
          };
          if (!data.doc || !Array.isArray(data.doc.nodes)) throw new Error('文件格式不正确');
          openFile({ fileName: data.fileName, doc: data.doc, baseline: data.baseline });
          showToast(`已打开 ${data.fileName}`);
        } catch (err) {
          showToast(`打开失败：${(err as Error).message}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleNew = () => {
    if (docState.dirty && !window.confirm('当前有未保存修改，确定新建文件吗？')) return;
    newFile();
    showToast('已新建空白项目');
  };

  // ---------- 导出 ----------
  const handleExportSvg = () => {
    const svg = buildSvg(docState.doc);
    downloadSvg(svg, `${docState.fileName.replace(/\s+/g, '_')}.svg`);
    showToast('SVG 已导出');
  };

  // ---------- 画布事件 ----------
  const requestAnnotationText = (loop: PathData) => {
    setAnnoText('');
    setModal({ kind: 'annotation', loop });
  };

  const confirmAnnotation = () => {
    const m = modal();
    if (m.kind === 'annotation' && annoText().trim()) {
      addAnnotation(m.loop, annoText().trim(), uiState.reviewerName);
      showToast('批注已添加');
    }
    setModal({ kind: 'none' });
  };

  // ---------- 快捷键 ----------
  const toolByKey: Record<string, ToolId> = {
    v: 'select',
    a: 'node',
    h: 'pan',
    g: 'annotate',
  };

  const onKey = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }
    if (mod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
      e.preventDefault();
      redo();
      return;
    }
    if (mod && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      // 复用工具栏的复制按钮行为
      document.querySelector<HTMLButtonElement>('button[title="复制"]')?.click();
      return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      deleteSelected();
      return;
    }
    const t = toolByKey[e.key.toLowerCase()];
    if (t) setUi('tool', t);
  };

  onMount(() => {
    window.addEventListener('keydown', onKey);
    window.addEventListener('stage:insert-node', ((ev: CustomEvent) => {
      const { shapeId, nodeIndex, at } = ev.detail as {
        shapeId: string;
        nodeIndex: number;
        at: { x: number; y: number };
      };
      insertNodeOnSegment(shapeId, nodeIndex, at);
    }) as EventListener);
    window.addEventListener('stage:edit-compound', ((ev: CustomEvent) => {
      // 进入复合节点编辑态：源形状可直接选中拖动，再切节点工具可编辑锚点
      setUi('compoundEditId', (ev.detail as { id: string }).id);
    }) as EventListener);
    window.addEventListener('stage:edit-group', ((ev: CustomEvent) => {
      setUi('groupEditId', (ev.detail as { id: string }).id);
    }) as EventListener);
    // 文档变化后自动保存（store 已防抖）
    const timer = setInterval(scheduleAutosave, 1500);
    onCleanup(() => clearInterval(timer));
  });

  onCleanup(() => window.removeEventListener('keydown', onKey));

  return (
    <div class="app">
      <Toolbar
        onNewShape={handleNewShape}
        onSave={handleSave}
        onOpen={handleOpen}
        onNewFile={handleNew}
        onExportSvg={handleExportSvg}
        onExportProofs={() => setModal({ kind: 'proof' })}
        onCommitVersion={() => setModal({ kind: 'version-note' })}
      />
      <LayersPanel />
      <CanvasView onRequestAnnotationText={requestAnnotationText} />
      <SidePanel />
      <div class="status-bar">
        <span>{docState.fileName}{docState.dirty ? ' ●' : ''}</span>
        <span>工具：{uiState.tool}</span>
        <span>缩放：{Math.round(uiState.view.scale * 100)}%</span>
        <span>选中：{uiState.selection.length} 个</span>
        <span>吸附：{uiState.snappingEnabled ? '开（Alt 临时关闭）' : '关'}</span>
        <span style={{ flex: 1 }} />
        <span>审核人：{uiState.reviewerName} ｜ 制作方：{uiState.currentUserName}</span>
      </div>

      {modal().kind === 'annotation' && (
        <Modal
          title="审核圈选批注"
          onClose={() => setModal({ kind: 'none' })}
          footer={
            <>
              <button class="btn" onClick={() => setModal({ kind: 'none' })}>取消</button>
              <button class="btn active" onClick={confirmAnnotation}>提交批注</button>
            </>
          }
        >
          <div class="hint" style={{ margin: '4px 0 8px' }}>
            圈选区域已记录在画布上（红色轮廓），请填写审核意见：
          </div>
          <textarea
            rows="4"
            style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', 'border-radius': '6px' }}
            placeholder="例如：此处浪花与滑道接缝对齐偏差 5mm，请调整…"
            value={annoText()}
            onInput={(e) => setAnnoText(e.currentTarget.value)}
            autofocus
          />
        </Modal>
      )}

      {modal().kind === 'proof' && <ProofModal doc={docState.doc} onClose={() => setModal({ kind: 'none' })} />}

      {modal().kind === 'version-note' && <VersionNoteModal onClose={() => setModal({ kind: 'none' })} onDone={() => { setModal({ kind: 'none' }); showToast('新版本已提交'); }} />}

      {toast() && <div class="toast">{toast()}</div>}
    </div>
  );
}

// 版本说明模态框
function VersionNoteModal(props: { onClose: () => void; onDone: () => void }) {
  const [label, setLabel] = createSignal('');
  const [note, setNote] = createSignal('');
  return (
    <Modal
      title="提交新版本"
      onClose={props.onClose}
      footer={
        <>
          <button class="btn" onClick={props.onClose}>取消</button>
          <button
            class="btn active"
            onClick={() => {
              commitVersion(label().trim() || `v${uiState.versions.length + 1}`, note().trim());
              props.onDone();
            }}
          >
            提交
          </button>
        </>
      }
    >
      <div class="form-row">
        <label>版本号</label>
        <input type="text" placeholder={`v${uiState.versions.length + 1}`} value={label()} onInput={(e) => setLabel(e.currentTarget.value)} />
      </div>
      <div class="form-row">
        <label>变更说明</label>
        <textarea rows="4" value={note()} onInput={(e) => setNote(e.currentTarget.value)} />
      </div>
    </Modal>
  );
}
