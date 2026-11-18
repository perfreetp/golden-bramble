import { useEffect, useRef } from 'react';
import { FieldScene } from '../three/FieldScene';
import { useStore } from '../store';

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<FieldScene | null>(null);

  // 场景初始化(只执行一次)
  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new FieldScene(containerRef.current, {
      onPick: (id) => useStore.getState().setSelected(id ? [id] : []),
      onBoxSelect: (ids) => useStore.getState().setSelected(ids),
      onLassoSelect: (ids) => {
        const s = useStore.getState();
        if (s.taskDraft) s.addDraftRefs(ids);
        else s.setSelected(ids);
      },
      onPlace: (x, z) => {
        const s = useStore.getState();
        const targetId = s.selectedIds[0];
        if (!targetId) {
          window.alert('请先在右侧要素列表或图上选中一个要摆放的目标要素');
          return;
        }
        const f = s.featureMap.get(targetId);
        if (!f) return;
        s.upsertPlacement({ featureId: targetId, layer: f.layer, x, z });
      },
      onStats: (lod, zoom, cells, feats) => {
        useStore.getState().setViewStats({
          lod,
          zoom,
          visibleCells: cells,
          visibleFeatures: feats,
          totalCells: useStore.getState().grid.size,
        });
      },
    });
    sceneRef.current = scene;
    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // 搜索定位 → 驱动相机
  const focusNonce = useStore((s) => s.focusNonce);
  const focusTargetId = useStore((s) => s.focusTargetId);
  const featureMap = useStore((s) => s.featureMap);
  useEffect(() => {
    if (!focusTargetId || !sceneRef.current) return;
    const f = featureMap.get(focusTargetId);
    if (!f || f.geom.type !== 'point') return;
    sceneRef.current.focusOn(f.geom.x, f.geom.z);
  }, [focusNonce, focusTargetId, featureMap]);

  // 摆放点 / 提交结果 overlay 重绘
  const placementMode = useStore((s) => s.placementMode);
  const workingPlacements = useStore((s) => s.workingPlacements);
  const activeSubmissionId = useStore((s) => s.activeSubmissionId);
  const submissions = useStore((s) => s.submissions);
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (placementMode) {
      scene.setOverlayData(
        workingPlacements.map((p) => ({ x: p.x, z: p.z, kind: 'work' as const })),
      );
      return;
    }
    const sub = submissions.find((x) => x.id === activeSubmissionId);
    if (sub) {
      scene.setOverlayData(
        sub.placements.map((p) => {
          const target = featureMap.get(p.featureId);
          const tx = target?.geom.type === 'point' ? target.geom.x : p.x;
          const tz = target?.geom.type === 'point' ? target.geom.z : p.z;
          return { x: p.x, z: p.z, kind: 'submit' as const, tx, tz };
        }),
      );
    } else {
      scene.setOverlayData([]);
    }
  }, [placementMode, workingPlacements, activeSubmissionId, submissions, featureMap]);

  const viewStats = useStore((s) => s.viewStats);
  const taskDraft = useStore((s) => s.taskDraft);
  const totalFeatures = useStore((s) => s.features.length);
  const lodName = ['轮廓块 LOD0', '简化符号 LOD1', '完整符号+标注 LOD2'][viewStats.lod];

  const zoomBy = (deltaY: number) =>
    containerRef.current?.dispatchEvent(
      new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true }),
    );

  return (
    <div className="map-wrap" ref={containerRef}>
      <div className="map-tools">
        <button title="全幅显示" onClick={() => sceneRef.current?.fitAll()}>⛶</button>
        <button title="放大" onClick={() => zoomBy(-120)}>＋</button>
        <button title="缩小" onClick={() => zoomBy(120)}>－</button>
      </div>

      {placementMode && (
        <div className="map-mode-banner">
          摆放模式:先选中目标要素,再在图上点击位置摆放 · 已摆放 {workingPlacements.length} 处
        </div>
      )}
      {taskDraft && (
        <div className="map-mode-banner" style={{ background: 'rgba(157,23,77,0.92)', borderColor: '#f472b6' }}>
          圈任务模式:按住 Shift 拖鼠标套索圈选桩位/车道 · 已圈 {taskDraft.pileIds.length + taskDraft.laneIds.length} 个要素
        </div>
      )}

      <div className="map-status">
        <span className="chip">层级 <b>{lodName}</b></span>
        <span className="chip">缩放 <b>{viewStats.zoom.toFixed(2)}×</b></span>
        <span className="chip">视口网格 <b>{viewStats.visibleCells}</b>/{viewStats.totalCells}</span>
        <span className="chip">视口要素 <b>{viewStats.visibleFeatures}</b>/{totalFeatures}</span>
        <span className="chip">左键框选 · Shift+左键套索 · 右键平移 · 滚轮缩放</span>
      </div>
    </div>
  );
}
