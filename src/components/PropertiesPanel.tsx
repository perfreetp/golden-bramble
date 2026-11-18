// 属性面板：填充/描边、复合节点编辑、弧排布参数
import { For, Show, createMemo } from 'solid-js';
import {
  bakeCompound,
  changeCompoundOp,
  docState,
  getNode,
  releaseCompound,
  setUi,
  uiState,
  updateArcLayout,
  updateStyle,
  applyArcLayout,
  removeArcLayout,
} from '../store';
import type { BooleanOp, CompoundNode, GroupNode, ShapeNode, StyleData } from '../types';

export default function PropertiesPanel() {
  const selected = createMemo(() => {
    const id = uiState.selection[0];
    return id ? getNode(docState.doc, id) : undefined;
  });

  return (
    <div>
      <Show when={selected()} fallback={<div class="hint">未选择图形。点击画布中的图形或图层查看属性。</div>}>
        {(node) => (
          <div>
            <Show when={node().type === 'shape' || node().type === 'compound'}>
              <StyleSection node={node() as ShapeNode | CompoundNode} />
            </Show>
            <Show when={node().type === 'compound'}>
              <CompoundSection node={node() as CompoundNode} />
            </Show>
            <Show when={node().type === 'group'}>
              <GroupSection node={node() as GroupNode} />
            </Show>
            <Show when={node().type === 'shape'}>
              <ShapeInfo node={node() as ShapeNode} />
            </Show>
          </div>
        )}
      </Show>
    </div>
  );
}

function StyleSection(props: { node: ShapeNode | CompoundNode }) {
  const style = (): StyleData => props.node.style;
  const patch = (p: Partial<StyleData>) => updateStyle(props.node.id, p);
  return (
    <div class="section">
      <h4>填充与描边（闭合路径）</h4>
      <div class="form-row">
        <label>填充</label>
        <input
          type="checkbox"
          checked={style().fill != null}
          onChange={(e) => patch({ fill: e.currentTarget.checked ? '#2f7fc1' : null })}
        />
        <Show when={style().fill != null}>
          <input type="color" value={style().fill ?? '#2f7fc1'} onInput={(e) => patch({ fill: e.currentTarget.value })} />
          <input
            type="text"
            value={style().fill ?? ''}
            onInput={(e) => patch({ fill: e.currentTarget.value })}
            style={{ flex: 1 }}
          />
        </Show>
      </div>
      <div class="form-row">
        <label>描边色</label>
        <input
          type="checkbox"
          checked={style().stroke != null}
          onChange={(e) => patch({ stroke: e.currentTarget.checked ? '#0f3a5f' : null })}
        />
        <Show when={style().stroke != null}>
          <input type="color" value={style().stroke ?? '#0f3a5f'} onInput={(e) => patch({ stroke: e.currentTarget.value })} />
          <input type="text" value={style().stroke ?? ''} onInput={(e) => patch({ stroke: e.currentTarget.value })} />
        </Show>
      </div>
      <div class="form-row">
        <label>描边宽度</label>
        <input
          type="number"
          min="0"
          max="40"
          step="0.5"
          value={style().strokeWidth}
          onInput={(e) => patch({ strokeWidth: Number(e.currentTarget.value) })}
        />
        <span class="hint">px</span>
      </div>
    </div>
  );
}

function CompoundSection(props: { node: CompoundNode }) {
  const ops: { id: BooleanOp; label: string }[] = [
    { id: 'union', label: '并集 ∪' },
    { id: 'subtract', label: '差集 −' },
    { id: 'intersect', label: '交集 ∩' },
  ];
  const editing = () => uiState.compoundEditId === props.node.id;
  return (
    <div class="section">
      <h4>布尔运算（源路径节点保留，可继续拖拽）</h4>
      <div class="form-row">
        <label>运算方式</label>
        <For each={ops}>
          {(op) => (
            <button
              class="btn small"
              classList={{ active: props.node.op === op.id }}
              onClick={() => changeCompoundOp(props.node.id, op.id)}
            >
              {op.label}
            </button>
          )}
        </For>
      </div>
      <div class="hint" style={{ margin: '6px 0' }}>
        参与节点（{props.node.childIds.length}）：差集以首个选择的图形为被减主体。
      </div>
      <div class="form-row">
        <button
          class="btn small"
          classList={{ active: editing() }}
          onClick={() => setUi('compoundEditId', editing() ? null : props.node.id)}
        >
          {editing() ? '退出源节点编辑' : '进入编辑（双击图形亦可）'}
        </button>
      </div>
      <div class="form-row">
        <button class="btn small" onClick={() => bakeCompound(props.node.id)}>烘焙为普通形状</button>
        <button class="btn small danger" onClick={() => releaseCompound(props.node.id)}>分离（删除结果壳）</button>
      </div>
    </div>
  );
}

function GroupSection(props: { node: GroupNode }) {
  const layout = () => props.node.arcLayout;
  return (
    <div class="section">
      <h4>成组图形 · 沿滑道弧长排布</h4>
      <Show
        when={layout()}
        fallback={
          <div>
            <div class="hint" style={{ margin: '6px 0' }}>
              将组内图形沿滑道中心线按指定弧长间距排布；无滑道时自动生成一条弧。
            </div>
            <button
              class="btn small"
              onClick={() =>
                applyArcLayout(props.node.id, { spacing: 120, startOffset: 0, rotateToTangent: true })
              }
            >
              启用沿弧排布
            </button>
          </div>
        }
      >
        {(l) => (
          <div>
            <div class="form-row">
              <label>弧长间距</label>
              <input
                type="number"
                min="1"
                value={l().spacing}
                onInput={(e) => updateArcLayout(props.node.id, { spacing: Number(e.currentTarget.value) })}
              />
              <span class="hint">px</span>
            </div>
            <div class="form-row">
              <label>起始偏移</label>
              <input
                type="number"
                min="0"
                value={l().startOffset}
                onInput={(e) => updateArcLayout(props.node.id, { startOffset: Number(e.currentTarget.value) })}
              />
              <span class="hint">px</span>
            </div>
            <div class="form-row">
              <label>随切线旋转</label>
              <input
                type="checkbox"
                checked={l().rotateToTangent}
                onChange={(e) => updateArcLayout(props.node.id, { rotateToTangent: e.currentTarget.checked })}
              />
            </div>
            <button class="btn small danger" onClick={() => removeArcLayout(props.node.id)}>取消沿弧排布</button>
          </div>
        )}
      </Show>
    </div>
  );
}

function ShapeInfo(props: { node: ShapeNode }) {
  return (
    <div class="section">
      <h4>路径信息</h4>
      <div class="hint">
        节点数：{props.node.path.nodes.length} · {props.node.path.closed ? '闭合路径' : '开放路径'}
        <br />
        切换到节点工具（✛）可拖拽锚点与贝塞尔控制柄，双击线段可插入节点。
      </div>
    </div>
  );
}
