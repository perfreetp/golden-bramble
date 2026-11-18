import { createSignal, createMemo, For, Show } from 'solid-js';
import Viewport from './three/Viewport';
import { PALETTE } from './state/palette';
import {
  editor, setEditor, models, currentModel, currentId, setCurrentId,
  addModel, deleteModel, notifyVoxels, voxVersion, showHint, cancelPaste,
  mutateModel, resetEditorForModel,
  batches, activeBatchId, setActiveBatchId, activeBatch,
  createBatch, deleteBatch, runBatchChecks, reviewIssue, passBatch, returnBatch, canPass,
} from './state/store';
import { greedyMesh, decimate } from './mesh/mesher';
import { exportGLB, exportOBJ } from './mesh/exporters';
import { rotate90, flip, scaleUp, scaleDown, copyRegion, clearRegion } from './voxel/ops';

const MODES = [
  { id: 'add', label: '加法' },
  { id: 'subtract', label: '减法' },
  { id: 'paint', label: '上色' },
  { id: 'select', label: '框选' },
];

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('zh-CN');
}
function deadlineText(ts) {
  const days = Math.ceil((ts - Date.now()) / 864e5);
  if (days < 0) return { text: `已逾期 ${-days} 天`, cls: 'overdue' };
  if (days === 0) return { text: '今天截止', cls: 'soon' };
  return { text: `剩余 ${days} 天`, cls: days <= 2 ? 'soon' : '' };
}

export default function App() {
  const [showNew, setShowNew] = createSignal(false);
  const [showBatch, setShowBatch] = createSignal(false);

  const meshInfo = createMemo(() => {
    voxVersion();
    const m = currentModel();
    if (!m) return null;
    const getter = (x, y, z) => {
      const c = m.voxels.get(x + ',' + y + ',' + z);
      return c === undefined ? -1 : c;
    };
    const g = greedyMesh(getter, m.nx, m.ny, m.nz);
    const dec = decimate(g.positions, g.quads, g.quadColors, editor.angleDeg, editor.minEdge / m.cellMm);
    return { quads: g.quads.length, tris: dec.tris.length, dec };
  });

  const layerCount = createMemo(() => {
    voxVersion();
    const m = currentModel();
    if (!m) return 0;
    let n = 0;
    const suffix = ',' + editor.currentZ;
    for (const k of m.voxels.keys()) if (k.endsWith(suffix)) n++;
    return n;
  });

  function fullSelection() {
    const sel = editor.selection;
    if (!sel) return null;
    return {
      ...sel,
      z0: Math.min(editor.selZ0, editor.selZ1),
      z1: Math.max(editor.selZ0, editor.selZ1),
    };
  }

  function doCopy(cut) {
    const m = currentModel();
    const sel = fullSelection();
    if (!m || !sel) return;
    const clip = copyRegion(m, sel);
    if (clip.cells.length === 0) {
      showHint('选区内没有体素', 'error');
      return;
    }
    if (cut) clearRegion(m, sel);
    setEditor('clipboard', clip);
    setEditor('selection', null);
    setEditor('pasteActive', true);
    setEditor('pasteAnchor', null);
    notifyVoxels();
    showHint(`已${cut ? '剪切' : '复制'} ${clip.cells.length} 个体素：移动鼠标选落点，左键放下，右键 / Esc 取消`, 'ok');
  }

  function doDeleteSelection() {
    const m = currentModel();
    const sel = fullSelection();
    if (!m || !sel) return;
    clearRegion(m, sel);
    setEditor('selection', null);
    notifyVoxels();
  }

  function doTransform(fn, label) {
    const m = currentModel();
    if (!m) return;
    mutateModel(m.id, fn);
    if (editor.currentZ >= m.nz) setEditor('currentZ', m.nz - 1);
    setEditor('selection', null);
    cancelPaste();
    showHint(label, 'ok');
  }

  return (
    <div class="app">
      <header>
        <div class="brand">宠物咬胶 · 体素造型台</div>
        <select
          class="model-select"
          value={currentId() ?? ''}
          onChange={(e) => { setCurrentId(e.target.value); resetEditorForModel(); }}
        >
          <For each={models()}>
            {(m) => <option value={m.id}>{m.name}（{m.cellMm}mm · {m.nx}×{m.ny}×{m.nz}）</option>}
          </For>
        </select>
        <button class="btn" onClick={() => setShowNew(true)}>新建模型</button>
        <button
          class="btn danger"
          disabled={!currentModel()}
          onClick={() => {
            const m = currentModel();
            if (m && window.confirm(`确定删除模型「${m.name}」？`)) deleteModel(m.id);
          }}
        >删除</button>
        <div class="spacer" />
        <div class="tabs">
          <button class={editor.tab === 'edit' ? 'tab active' : 'tab'} onClick={() => setEditor('tab', 'edit')}>建模台</button>
          <button class={editor.tab === 'qc' ? 'tab active' : 'tab'} onClick={() => setEditor('tab', 'qc')}>批次质检</button>
        </div>
      </header>

      <Show when={editor.tab === 'edit'}>
        <div class="main">
          <aside class="panel left">
            <section>
              <h3>画笔</h3>
              <div class="btn-row">
                <For each={MODES}>
                  {(md) => (
                    <button
                      class={editor.mode === md.id ? 'btn toggle active' : 'btn toggle'}
                      onClick={() => { setEditor('mode', md.id); cancelPaste(); }}
                    >{md.label}</button>
                  )}
                </For>
              </div>
              <div class="tip">左键绘制 · 右键旋转 · 滚轮缩放 · 中键平移</div>
            </section>

            <section>
              <h3>色卡</h3>
              <div class="swatches">
                <For each={PALETTE}>
                  {(c, i) => (
                    <button
                      class={editor.color === i() ? 'swatch active' : 'swatch'}
                      style={{ background: c.hex }}
                      title={c.name}
                      onClick={() => setEditor('color', i())}
                    >
                      <span class="swatch-name">{c.name}</span>
                    </button>
                  )}
                </For>
              </div>
            </section>

            <section>
              <h3>镜像对称</h3>
              <div class="btn-row">
                <button class={editor.mirrorX ? 'btn toggle active' : 'btn toggle'} onClick={() => setEditor('mirrorX', !editor.mirrorX)}>X 镜像</button>
                <button class={editor.mirrorY ? 'btn toggle active' : 'btn toggle'} onClick={() => setEditor('mirrorY', !editor.mirrorY)}>Y 镜像</button>
              </div>
              <div class="tip">开启后改一侧，另一侧实时跟着变</div>
            </section>

            <section>
              <h3>分层（Z 层）</h3>
              <Show when={currentModel()}>
                {(m) => (
                  <>
                    <div class="layer-row">
                      <input
                        type="range" min="0" max={m().nz - 1} value={editor.currentZ}
                        onInput={(e) => setEditor('currentZ', +e.target.value)}
                      />
                      <span class="layer-label">Z = {editor.currentZ}</span>
                    </div>
                    <div class="tip">本层体素 {layerCount()} 个 / 共 {m().nz} 层</div>
                    <label class="check">
                      <input type="checkbox" checked={editor.solo} onChange={(e) => setEditor('solo', e.target.checked)} />
                      只看当前层（隐藏其他层）
                    </label>
                  </>
                )}
              </Show>
            </section>

            <section>
              <h3>框选 / 粘贴</h3>
              <Show when={editor.selection} fallback={<div class="tip">切到「框选」模式，在图层上拖出选区</div>}>
                <div class="z-range">
                  <label>Z 起 <input type="number" min="0" max={currentModel()?.nz - 1} value={editor.selZ0}
                    onInput={(e) => setEditor('selZ0', Math.max(0, Math.min(currentModel().nz - 1, +e.target.value)))} /></label>
                  <label>Z 止 <input type="number" min="0" max={currentModel()?.nz - 1} value={editor.selZ1}
                    onInput={(e) => setEditor('selZ1', Math.max(0, Math.min(currentModel().nz - 1, +e.target.value)))} /></label>
                </div>
                <div class="btn-row">
                  <button class="btn" onClick={() => doCopy(false)}>复制</button>
                  <button class="btn" onClick={() => doCopy(true)}>剪切位移</button>
                </div>
                <div class="btn-row">
                  <button class="btn danger" onClick={doDeleteSelection}>删除选中</button>
                  <button class="btn" onClick={() => setEditor('selection', null)}>取消选择</button>
                </div>
              </Show>
              <Show when={editor.clipboard}>
                {(clip) => (
                  <div class="clip-info">
                    剪贴板：{clip().cells.length} 体素（{clip().w}×{clip().h}×{clip().d}）
                    <button class="btn" onClick={() => { setEditor('pasteActive', true); showHint('移动鼠标选落点，左键放下，右键 / Esc 取消'); }}>进入粘贴</button>
                  </div>
                )}
              </Show>
              <Show when={editor.pasteActive}>
                <div class="tip warn-text">粘贴中：绿色可落下，红色为占用冲突，有冲突不能落下</div>
              </Show>
            </section>

            <section>
              <h3>整体变换</h3>
              <div class="btn-row">
                <button class="btn" onClick={() => doTransform((m) => rotate90(m, 'x'), '已绕 X 旋转 90°')}>绕X 90°</button>
                <button class="btn" onClick={() => doTransform((m) => rotate90(m, 'y'), '已绕 Y 旋转 90°')}>绕Y 90°</button>
                <button class="btn" onClick={() => doTransform((m) => rotate90(m, 'z'), '已绕 Z 旋转 90°')}>绕Z 90°</button>
              </div>
              <div class="btn-row">
                <button class="btn" onClick={() => doTransform((m) => flip(m, 'x'), '已沿 X 镜像翻转')}>翻转X</button>
                <button class="btn" onClick={() => doTransform((m) => flip(m, 'y'), '已沿 Y 镜像翻转')}>翻转Y</button>
                <button class="btn" onClick={() => doTransform((m) => flip(m, 'z'), '已沿 Z 镜像翻转')}>翻转Z</button>
              </div>
              <div class="btn-row">
                <button class="btn" onClick={() => doTransform(scaleUp, '已放大 ×2')}>缩放 ×2</button>
                <button class="btn" onClick={() => doTransform(scaleDown, '已缩小 ×½')}>缩放 ×½</button>
              </div>
            </section>
          </aside>

          <Viewport />

          <aside class="panel right">
            <Show when={currentModel()} fallback={<div class="tip">请先新建模型</div>}>
              {(m) => (
                <>
                  <section>
                    <h3>模型信息</h3>
                    <div class="kv"><span>名称</span><b>{m().name}</b></div>
                    <div class="kv"><span>体素栅格</span><b>{m().cellMm}mm</b></div>
                    <div class="kv"><span>栅格尺寸</span><b>{m().nx} × {m().ny} × {m().nz}</b></div>
                    <div class="kv"><span>实际尺寸</span><b>{m().nx * m().cellMm} × {m().ny * m().cellMm} × {m().nz * m().cellMm} mm</b></div>
                    <div class="kv"><span>体素数</span><b>{m().voxels.size}</b></div>
                  </section>
                  <section>
                    <h3>网格合并与减面</h3>
                    <label class="slider-row">
                      角度阈值 {editor.angleDeg}°
                      <input type="range" min="0" max="60" step="1" value={editor.angleDeg}
                        onInput={(e) => setEditor('angleDeg', +e.target.value)} />
                    </label>
                    <label class="slider-row">
                      最小边长 {editor.minEdge} mm
                      <input type="range" min="0" max={m().cellMm * 1.5} step="0.5" value={editor.minEdge}
                        onInput={(e) => setEditor('minEdge', +e.target.value)} />
                    </label>
                    <Show when={meshInfo()}>
                      {(info) => (
                        <>
                          <div class="kv"><span>合并后四边面</span><b>{info().quads}</b></div>
                          <div class="kv"><span>减面后三角面</span><b class="face-count">{info().tris}</b></div>
                        </>
                      )}
                    </Show>
                    <div class="btn-row">
                      <button class="btn primary" onClick={() => exportGLB(m(), meshInfo().dec)}>导出 GLB</button>
                      <button class="btn primary" onClick={() => exportOBJ(m(), meshInfo().dec)}>导出 OBJ</button>
                    </div>
                    <div class="tip">导出文件名与材质名均带色卡名</div>
                  </section>
                </>
              )}
            </Show>
          </aside>
        </div>
      </Show>

      <Show when={editor.tab === 'qc'}>
        <QcView onOpenModel={(id) => { setCurrentId(id); resetEditorForModel(); setEditor('tab', 'edit'); }} />
      </Show>

      <Show when={editor.hint}>
        <div class={'hint ' + editor.hintKind}>{editor.hint}</div>
      </Show>

      <Show when={showNew()}>
        <NewModelDialog onClose={() => setShowNew(false)} />
      </Show>
      <Show when={showBatch()}>
        <NewBatchDialog onClose={() => setShowBatch(false)} />
      </Show>

      <Show when={editor.tab === 'qc'}>
        <button class="fab" onClick={() => setShowBatch(true)}>＋ 新建批次</button>
      </Show>
    </div>
  );
}

// ---------- 新建模型 ----------
function NewModelDialog(props) {
  const [name, setName] = createSignal('新模型');
  const [cellMm, setCellMm] = createSignal(8);
  const [nx, setNx] = createSignal(28);
  const [ny, setNy] = createSignal(16);
  const [nz, setNz] = createSignal(12);

  function submit() {
    addModel({
      name: name().trim() || '未命名模型',
      cellMm: cellMm(),
      nx: Math.max(4, Math.min(128, nx() | 0)),
      ny: Math.max(4, Math.min(128, ny() | 0)),
      nz: Math.max(2, Math.min(128, nz() | 0)),
    });
    props.onClose();
  }

  return (
    <div class="modal-mask" onClick={props.onClose}>
      <div class="modal" onClick={(e) => e.stopPropagation()}>
        <h3>新建模型</h3>
        <label class="field">模型名称
          <input type="text" value={name()} onInput={(e) => setName(e.target.value)} />
        </label>
        <div class="field">体素栅格
          <div class="btn-row">
            <button class={cellMm() === 8 ? 'btn toggle active' : 'btn toggle'} onClick={() => setCellMm(8)}>8mm（常规）</button>
            <button class={cellMm() === 4 ? 'btn toggle active' : 'btn toggle'} onClick={() => setCellMm(4)}>4mm（精细）</button>
          </div>
        </div>
        <div class="field dims">
          <label>X 格数 <input type="number" value={nx()} onInput={(e) => setNx(+e.target.value)} /></label>
          <label>Y 格数 <input type="number" value={ny()} onInput={(e) => setNy(+e.target.value)} /></label>
          <label>Z 层数 <input type="number" value={nz()} onInput={(e) => setNz(+e.target.value)} /></label>
        </div>
        <div class="tip">实际尺寸约 {nx() * cellMm()} × {ny() * cellMm()} × {nz() * cellMm()} mm</div>
        <div class="btn-row right">
          <button class="btn" onClick={props.onClose}>取消</button>
          <button class="btn primary" onClick={submit}>创建</button>
        </div>
      </div>
    </div>
  );
}

// ---------- 新建批次 ----------
function NewBatchDialog(props) {
  const [name, setName] = createSignal('B-' + new Date().toISOString().slice(0, 10).replaceAll('-', '') + '-01');
  const [supplier, setSupplier] = createSignal('');
  const [deadline, setDeadline] = createSignal(new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10));
  const [picked, setPicked] = createSignal(new Set(models().map((m) => m.id)));

  function toggle(id) {
    const s = new Set(picked());
    if (s.has(id)) s.delete(id); else s.add(id);
    setPicked(s);
  }

  function submit() {
    if (picked().size === 0) { showHint('至少选择一个模型', 'error'); return; }
    createBatch({
      name: name().trim() || '未命名批次',
      supplier: supplier().trim() || '未填写供应方',
      deadline: new Date(deadline() + 'T23:59:59').getTime(),
      modelIds: [...picked()],
    });
    props.onClose();
  }

  return (
    <div class="modal-mask" onClick={props.onClose}>
      <div class="modal" onClick={(e) => e.stopPropagation()}>
        <h3>新建质检批次</h3>
        <label class="field">批次号 <input type="text" value={name()} onInput={(e) => setName(e.target.value)} /></label>
        <label class="field">供应方 <input type="text" value={supplier()} placeholder="供应方名称" onInput={(e) => setSupplier(e.target.value)} /></label>
        <label class="field">截止时间 <input type="date" value={deadline()} onInput={(e) => setDeadline(e.target.value)} /></label>
        <div class="field">包含模型
          <div class="model-pick">
            <For each={models()}>
              {(m) => (
                <label class="check">
                  <input type="checkbox" checked={picked().has(m.id)} onChange={() => toggle(m.id)} />
                  {m.name}
                </label>
              )}
            </For>
          </div>
        </div>
        <div class="btn-row right">
          <button class="btn" onClick={props.onClose}>取消</button>
          <button class="btn primary" onClick={submit}>创建批次</button>
        </div>
      </div>
    </div>
  );
}

// ---------- 批次质检 ----------
function QcView(props) {
  return (
    <div class="qc">
      <aside class="panel qc-list">
        <h3>质检批次</h3>
        <For each={batches()} fallback={<div class="tip">还没有批次，点右下角「新建批次」</div>}>
          {(b) => {
            const dl = () => deadlineText(b.deadline);
            return (
              <div class={activeBatchId() === b.id ? 'batch-card active' : 'batch-card'} onClick={() => setActiveBatchId(b.id)}>
                <div class="batch-head">
                  <b>{b.name}</b>
                  <span class={'status st-' + b.status}>{b.status}</span>
                </div>
                <div class="batch-sub">{b.supplier} · {b.modelIds.length} 个模型</div>
                <div class="batch-sub">
                  截止 {fmtDate(b.deadline)} <span class={dl().cls}>（{dl().text}）</span>
                  <Show when={b.rework > 0}> · 返工 {b.rework} 次</Show>
                </div>
              </div>
            );
          }}
        </For>
      </aside>

      <div class="qc-detail">
        <Show when={activeBatch()} fallback={<div class="tip center">选择左侧批次查看详情</div>}>
          {(b) => <BatchDetail batch={b()} onOpenModel={props.onOpenModel} />}
        </Show>
      </div>
    </div>
  );
}

function BatchDetail(props) {
  const b = () => props.batch;
  const dl = () => deadlineText(b().deadline);
  const pendingCount = () => b().issues.filter((i) => i.review === 'pending').length;
  const confirmedSev = () => b().issues.filter((i) => i.review === 'confirmed' && i.sev === '严重').length;

  return (
    <div class="batch-detail">
      <div class="batch-title">
        <div>
          <h2>{b().name} <span class={'status st-' + b().status}>{b().status}</span></h2>
          <div class="batch-sub">
            供应方：{b().supplier} · 截止 {fmtDate(b().deadline)}
            <span class={dl().cls}>（{dl().text}）</span> · 返工 {b().rework} 次
          </div>
        </div>
        <div class="btn-row">
          <Show when={b().status === '待质检' || b().status === '已退回' || b().status === '复核中'}>
            <button class="btn primary" onClick={() => runBatchChecks(b().id)}>
              {b().status === '复核中' ? '重新跑检查' : '运行自动质检'}
            </button>
          </Show>
          <button class="btn danger" onClick={() => { if (window.confirm('删除该批次？')) deleteBatch(b().id); }}>删除批次</button>
        </div>
      </div>

      <div class="qc-models">
        <For each={b().modelIds}>
          {(mid) => {
            const m = () => models().find((x) => x.id === mid);
            const cnt = () => b().issues.filter((i) => i.modelId === mid).length;
            return (
              <div class="qc-model">
                <span>{m() ? m().name : '（模型已删除）'}</span>
                <span class="tip">{cnt() ? `${cnt()} 条问题` : '无问题'}</span>
                <Show when={m()}>
                  <button class="btn small" onClick={() => props.onOpenModel(mid)}>打开修改</button>
                </Show>
              </div>
            );
          }}
        </For>
      </div>

      <Show when={b().status === '复核中' || b().issues.length > 0}>
        <table class="issues">
          <thead>
            <tr><th>模型</th><th>级别</th><th>问题描述</th><th>复核</th></tr>
          </thead>
          <tbody>
            <For each={b().issues} fallback={<tr><td colspan="4" class="tip center">自动质检未发现问题</td></tr>}>
              {(iss) => (
                <tr>
                  <td>{iss.modelName}</td>
                  <td><span class={iss.sev === '严重' ? 'sev sev-high' : 'sev sev-low'}>{iss.sev}</span></td>
                  <td>{iss.msg}</td>
                  <td>
                    <Show when={iss.review === 'pending'} fallback={
                      <span class={iss.review === 'confirmed' ? 'review confirmed' : 'review rejected'}>
                        {iss.review === 'confirmed' ? '已确认' : '已驳回'}
                      </span>
                    }>
                      <button class="btn small danger" onClick={() => reviewIssue(b().id, iss.id, 'confirmed')}>确认</button>
                      <button class="btn small" onClick={() => reviewIssue(b().id, iss.id, 'rejected')}>驳回</button>
                    </Show>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Show>

      <Show when={b().status === '复核中'}>
        <div class="verdict">
          <Show when={pendingCount() > 0}>
            <span class="tip">还有 {pendingCount()} 条问题待复核，逐条确认或驳回后才能判定</span>
          </Show>
          <Show when={pendingCount() === 0 && confirmedSev() > 0}>
            <span class="sev sev-high">{confirmedSev()} 条严重问题已确认，整批不达标，应退回供应方</span>
          </Show>
          <Show when={canPass(b())}>
            <span class="ok-text">所有问题已复核，无确认的严重问题，整批达标</span>
          </Show>
          <div class="btn-row">
            <button class="btn primary" disabled={!canPass(b())} onClick={() => passBatch(b().id)}>放行</button>
            <button class="btn danger" onClick={() => { if (window.confirm('退回供应方并记一次返工？')) returnBatch(b().id); }}>退回供应方</button>
          </div>
        </div>
      </Show>

      <div class="history">
        <h4>流转记录</h4>
        <For each={[...b().history].reverse()}>
          {(h) => <div class="history-item">{new Date(h.t).toLocaleString('zh-CN')} — {h.text}</div>}
        </For>
      </div>
    </div>
  );
}
