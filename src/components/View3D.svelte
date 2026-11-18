<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { CourseRenderer } from '../lib/babylon/CourseRenderer';
  import { fieldStore, selectedUnitId, wireframeOn, updateUnit } from '../lib/stores';
  import type { FieldState, ObstacleUnit } from '../lib/types';

  let canvas: HTMLCanvasElement;
  export let rendererRef: CourseRenderer | null = null;
  let renderer: CourseRenderer | null = null;
  let status = '';

  // Gizmo 回写产生的 store 变更只做局部重建，其余变更（生成/锁定/面板）全量重建
  let localEditId: string | null = null;
  let prevUnits: ObstacleUnit[] = [];

  onMount(() => {
    let first = true;
    renderer = new CourseRenderer(canvas, $fieldStore);
    rendererRef = renderer;
    renderer.frameCamera();
    prevUnits = $fieldStore.units;

    const unsub = fieldStore.subscribe((f: FieldState) => {
      if (!renderer) return;
      if (first) {
        first = false;
        return; // 构造函数已用首帧数据构建
      }

      if (localEditId) {
        const changed = f.units.find((u) => u.id === localEditId);
        localEditId = null;
        if (changed) {
          renderer.rebuildUnit(changed);
          renderer.refreshAnnotations();
          prevUnits = f.units;
          return;
        }
      }

      // 单元集合不变 => 局部重建所有发生变化的单元（面板/Gizmo 编辑）；
      // 集合变化（生成、增删）=> 全量重建
      const sameSet =
        f.units.length === prevUnits.length &&
        f.units.every((u, i) => u.id === prevUnits[i]?.id);
      const oldUnits = prevUnits;
      prevUnits = f.units;
      if (sameSet) {
        f.units.forEach((u, i) => {
          if (JSON.stringify(u) !== JSON.stringify(oldUnits[i])) renderer!.rebuildUnit(u);
        });
        renderer!.refreshAnnotations();
      } else {
        renderer.rebuildField(f);
      }
    });

    const unsubWire = wireframeOn.subscribe((on) => renderer?.setWireframe(on));
    const unsubSel = selectedUnitId.subscribe((id) => {
      if (renderer && renderer.selectedUnitId !== id) renderer.select(id);
    });

    renderer.onUnitEdited = (unit) => {
      localEditId = unit.id;
      updateUnit(unit);
      status = `已更新单元 ${unit.id}（位置 ${Math.round(unit.position.x)}, ${Math.round(unit.position.z)}）`;
    };
    renderer.onSelect = (id) => selectedUnitId.set(id);

    return () => {
      unsub();
      unsubWire();
      unsubSel();
      renderer?.dispose();
      renderer = null;
    };
  });

  onDestroy(() => renderer?.dispose());

  function frame() {
    renderer?.frameCamera();
  }
</script>

<div class="viewport">
  <canvas bind:this={canvas}></canvas>
  <div class="hud">
    <button on:click={frame}>复位视角</button>
    <button class:primary={$wireframeOn} on:click={() => wireframeOn.update((v) => !v)}>
      {$wireframeOn ? '关闭线框' : '线框/包围盒/坡度'}
    </button>
  </div>
  <div class="tip muted">
    左键旋转 · 右键平移 · 滚轮缩放 · 点选单元后拖动 Gizmo 改位置/旋转/尺寸（100mm、15° 吸附）
    {#if status}<span class="status">{status}</span>{/if}
  </div>
</div>

<style>
  .viewport {
    position: relative;
    height: 100%;
    min-height: 420px;
  }
  canvas {
    width: 100%;
    height: 100%;
    outline: none;
    touch-action: none;
  }
  .hud {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    gap: 8px;
  }
  .tip {
    position: absolute;
    bottom: 8px;
    left: 10px;
    right: 10px;
    font-size: 12px;
    background: rgba(15, 19, 28, 0.75);
    padding: 5px 9px;
    border-radius: 6px;
  }
  .status {
    color: var(--accent-2);
    margin-left: 12px;
  }
</style>
