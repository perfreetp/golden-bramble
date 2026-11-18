// Pixi 画布宿主组件
import { onCleanup, onMount } from 'solid-js';
import { PixiStage } from '../canvas/pixi-stage';
import { setUi, uiState } from '../store';
import type { PathData } from '../types';

interface Props {
  onRequestAnnotationText: (loop: PathData) => void;
}

export default function CanvasView(props: Props) {
  let host: HTMLDivElement | undefined;
  let stage: PixiStage | null = null;

  onMount(() => {
    if (!host) return;
    stage = new PixiStage(host, {
      onAnnotationCreated: (loop) => props.onRequestAnnotationText(loop),
    });
    // 调试/自动化钩子
    (window as unknown as { __stage?: PixiStage | null }).__stage = stage;
  });

  onCleanup(() => {
    stage?.dispose();
    stage = null;
  });

  return (
    <div class="canvas-wrap" ref={host}>
      <div class="canvas-toolbar-float">
        <span class="hint">滚轮缩放 · 平移工具拖动 · Shift 多选 · Alt 临时关闭吸附</span>
        <button
          class="btn small"
          classList={{ active: uiState.snappingEnabled }}
          onClick={() => setUi('snappingEnabled', !uiState.snappingEnabled)}
          title="切换边缘吸附"
        >
          吸附{uiState.snappingEnabled ? '开' : '关'}
        </button>
      </div>
    </div>
  );
}
