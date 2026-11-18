// 版本面板：每次提交生成新版本，支持两版叠加对比差异
import { For, Show, createSignal } from 'solid-js';
import {
  commitVersion,
  docState,
  getVersionRecord,
  setCompareVersion,
  setUi,
  uiState,
} from '../store';
import { compareDocCache } from '../canvas/pixi-stage';
import { buildDiffSvg, downloadSvg } from '../lib/exporters';

export default function VersionsPanel() {
  const [label, setLabel] = createSignal('');
  const [note, setNote] = createSignal('');

  const submit = () => {
    const rec = commitVersion(label().trim(), note().trim());
    setLabel('');
    setNote('');
    return rec;
  };

  const toggleCompare = (id: string) => {
    if (uiState.compareVersionId === id) {
      setCompareVersion(null);
      return;
    }
    const rec = getVersionRecord(id);
    if (!rec) return;
    compareDocCache.set(id, rec.doc);
    setCompareVersion(id);
  };

  const exportDiff = (id: string) => {
    const rec = getVersionRecord(id);
    if (!rec) return;
    const svg = buildDiffSvg(docState.doc, rec.doc);
    downloadSvg(svg, `diff-${rec.label}.svg`);
  };

  return (
    <div>
      <div class="section">
        <h4>提交新版本（快照当前文档与批注）</h4>
        <div class="form-row">
          <label>版本号</label>
          <input
            type="text"
            placeholder={`v${uiState.versions.length + 1}`}
            value={label()}
            onInput={(e) => setLabel(e.currentTarget.value)}
          />
        </div>
        <div class="form-row">
          <label>变更说明</label>
          <textarea rows="2" value={note()} onInput={(e) => setNote(e.currentTarget.value)} />
        </div>
        <button class="btn small" style={{ width: '100%' }} onClick={submit}>
          提交版本
        </button>
      </div>

      <div class="section">
        <h4>版本对比</h4>
        <Show when={uiState.compareVersionId} fallback={<div class="hint">选择任一历史版本，将以橙色虚线叠加到当前画布上对比差异。</div>}>
          <div class="form-row">
            <label>叠加透明度</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={uiState.compareOpacity}
              onInput={(e) => setUi('compareOpacity', Number(e.currentTarget.value))}
            />
            <span class="hint">{Math.round(uiState.compareOpacity * 100)}%</span>
          </div>
        </Show>
      </div>

      <Show when={uiState.versions.length} fallback={<div class="hint">还没有版本记录。</div>}>
        <For each={[...uiState.versions].reverse()}>
          {(v) => (
            <div class="version-card" classList={{ comparing: uiState.compareVersionId === v.id }}>
              <div style={{ display: 'flex', 'justify-content': 'space-between' }}>
                <span class="version-title">{v.label}</span>
                <span class="anno-meta">{new Date(v.createdAt).toLocaleString()}</span>
              </div>
              <div class="version-note">{v.note || '（无说明）'}</div>
              <div class="form-row" style={{ margin: '6px 0 0' }}>
                <button class="btn small" onClick={() => toggleCompare(v.id)}>
                  {uiState.compareVersionId === v.id ? '取消叠加' : '叠加对比'}
                </button>
                <button class="btn small" onClick={() => exportDiff(v.id)}>导出差异SVG</button>
              </div>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
}
