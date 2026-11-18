import * as THREE from 'three';
import type { Feature, LayerId, PointKind, LineKind, AreaKind } from '../types';
import { FIELD, CELL_SIZE } from '../data/generator';
import { boundsOf, type Rect } from '../lib/spatial';
import { createSymbolGeometry, createSymbolOutline, KIND_COLOR, DOT_COLOR } from './symbols';
import { useStore, selectEffective } from '../store';

// LOD 阈值:视口高度(米)
const LOD0_H = 120; // 高于此只画轮廓块
const LOD2_H = 30; // 低于此画完整符号与文字标注
const LABEL_CAP = 28;
const LABEL_MIN_GAP = 9; // 同屏标注最小世界间距(米)
const PICK_PX = 8;

export interface OverlayPoint {
  x: number;
  z: number;
  kind: 'work' | 'submit';
  tx?: number;
  tz?: number;
}

export interface SceneCallbacks {
  onPick: (id: string | null) => void;
  onBoxSelect: (ids: string[]) => void;
  onLassoSelect: (ids: string[]) => void;
  onPlace: (x: number, z: number) => void;
  onStats: (lod: 0 | 1 | 2, zoom: number, cells: number, feats: number) => void;
}

interface CellMeshes {
  key: string;
  cx: number;
  cz: number;
  bounds: Rect;
  layers: Partial<Record<LayerId, THREE.Object3D>>;
  /** LOD0 轮廓块 */
  outline: THREE.LineSegments;
  /** LOD1 点要素实例 */
  dots?: THREE.InstancedMesh;
  /** LOD2 完整符号实例(按 kind) */
  symbols?: Map<PointKind, THREE.InstancedMesh>;
  symbolOutlines?: Map<PointKind, THREE.LineSegments>;
  /** 射线检测用(面要素) */
  pickMeshes: THREE.Object3D[];
  featureIds: string[];
}

const LINE_COLORS: Record<LineKind, number> = {
  solid: 0xffffff,
  dashed: 0xd6d3d1,
  edge: 0xfbbf24,
  stop: 0xef4444,
  guide: 0x7dd3fc,
};

const AREA_COLORS: Record<AreaKind, number> = {
  building: 0x9ca3af,
  pavement: 0x3f4147,
  green: 0x4d7c0f,
  wall: 0x78716c,
  bay: 0x52525b,
};

const LAYER_Z: Record<LayerId, number> = {
  base: 0,
  lane: 0.06,
  pile: 0.14,
  sign: 0.18,
  device: 0.22,
};

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export class FieldScene {
  private container: HTMLElement;
  private cb: SceneCallbacks;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.OrthographicCamera;
  private raycaster = new THREE.Raycaster();
  private cells = new Map<string, CellMeshes>();
  private root = new THREE.Group();
  private labelGroup = new THREE.Group();
  private highlight!: THREE.Mesh;
  private blinkRing!: THREE.Mesh;
  private selectionRect!: THREE.Line;
  private lassoLine!: THREE.Line;
  private labels: THREE.Sprite[] = [];
  private labelTextureCache = new Map<string, THREE.Texture>();
  private labelPool: THREE.Sprite[] = [];
  private overlayGroup = new THREE.Group();
  private overlayMatWork = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
  private overlayMatSubmit = new THREE.MeshBasicMaterial({ color: 0x34d399 });
  private overlayLineMat = new THREE.LineBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.8 });
  private resizeObs: ResizeObserver;
  private raf = 0;
  private disposed = false;

  // 相机与视图
  private viewH = FIELD.depth;
  private zoom = 1;
  private panStart: { x: number; y: number; cx: number; cz: number } | null = null;
  private dragMode: 'none' | 'pan' | 'box' | 'lasso' = 'none';
  private dragStartPx: { x: number; y: number } | null = null;
  private lassoPts: [number, number][] = [];
  private blinkId: string | null = null;
  private blinkNonce = -1;
  private blinkUntil = 0;
  private sceneVersion = -1;
  private lastStore = '';
  private rebuildQueued = false;
  private lastStatsEmit = 0;

  constructor(container: HTMLElement, cb: SceneCallbacks) {
    this.container = container;
    this.cb = cb;
    const w = container.clientWidth;
    const h = container.clientHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.setClearColor(0x23252b);
    container.appendChild(this.renderer.domElement);

    const aspect = w / h;
    this.camera = new THREE.OrthographicCamera(
      (-FIELD.depth * aspect) / 2,
      (FIELD.depth * aspect) / 2,
      FIELD.depth / 2,
      -FIELD.depth / 2,
      0.1,
      1000,
    );
    this.camera.position.set(0, 200, 0);
    this.camera.up.set(0, 0, -1);
    this.camera.lookAt(0, 0, 0);

    this.scene.add(this.root);
    this.scene.add(this.labelGroup);
    this.overlayGroup.renderOrder = 60;
    this.scene.add(this.overlayGroup);
    this.buildCells();
    this.buildHelpers();
    this.bindEvents();
    this.fitAll();

    this.resizeObs = new ResizeObserver(() => this.onResize());
    this.resizeObs.observe(container);

    const loop = () => {
      if (this.disposed) return;
      this.raf = requestAnimationFrame(loop);
      this.tick();
    };
    loop();
  }

  // ============ 构建 ============
  private buildCells() {
    const s = useStore.getState();
    const { grid, featureMap } = s;
    for (const [key, cell] of grid) {
      const x0 = cell.cx * CELL_SIZE;
      const z0 = cell.cz * CELL_SIZE;
      const bounds: Rect = { minX: x0, minZ: z0, maxX: x0 + CELL_SIZE, maxZ: z0 + CELL_SIZE };
      const cm: CellMeshes = {
        key,
        cx: cell.cx,
        cz: cell.cz,
        bounds,
        layers: {},
        outline: this.buildOutline(bounds),
        pickMeshes: [],
        featureIds: cell.featureIds,
      };
      const byLayer = new Map<LayerId, Feature[]>();
      const areaFeats: Feature[] = [];
      for (const id of cell.featureIds) {
        const f = featureMap.get(id);
        if (!f) continue;
        const eff = selectEffective(f, s);
        const arr = byLayer.get(eff.layer) ?? [];
        arr.push(f);
        byLayer.set(eff.layer, arr);
        if (f.geom.type === 'area' && f.layer === 'base') areaFeats.push(f);
      }
      // 把面要素轮廓并入 cell 轮廓线(LOD0 可看到建筑/围墙形状)
      if (areaFeats.length) this.appendAreaOutlines(cm.outline, areaFeats);
      for (const [layer, feats] of byLayer) {
        const obj = this.buildLayerObject(layer, feats, cm);
        cm.layers[layer] = obj;
        this.root.add(obj);
      }
      this.root.add(cm.outline);
      this.cells.set(key, cm);
    }
  }

  private buildOutline(b: Rect): THREE.LineSegments {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(b.minX, 0.02, b.minZ),
      new THREE.Vector3(b.maxX, 0.02, b.minZ),
      new THREE.Vector3(b.maxX, 0.02, b.minZ),
      new THREE.Vector3(b.maxX, 0.02, b.maxZ),
      new THREE.Vector3(b.maxX, 0.02, b.maxZ),
      new THREE.Vector3(b.minX, 0.02, b.maxZ),
      new THREE.Vector3(b.minX, 0.02, b.maxZ),
      new THREE.Vector3(b.minX, 0.02, b.minZ),
    ]);
    const mat = new THREE.LineBasicMaterial({ color: 0x8b8b92, transparent: true, opacity: 0.85 });
    const line = new THREE.LineSegments(geo, mat);
    line.visible = false;
    return line;
  }

  private appendAreaOutlines(line: THREE.LineSegments, feats: Feature[]) {
    const pts: THREE.Vector3[] = [];
    for (const f of feats) {
      if (f.geom.type !== 'area') continue;
      const poly = f.geom.points;
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        pts.push(new THREE.Vector3(a[0], 0.03, a[1]), new THREE.Vector3(b[0], 0.03, b[1]));
      }
    }
    const old = line.geometry.attributes.position;
    const merged = new Float32Array(old.count * 3 + pts.length * 3);
    merged.set(old.array as Float32Array);
    pts.forEach((p, i) => {
      merged[(old.count + i) * 3] = p.x;
      merged[(old.count + i) * 3 + 1] = p.y;
      merged[(old.count + i) * 3 + 2] = p.z;
    });
    line.geometry.dispose();
    line.geometry = new THREE.BufferGeometry();
    line.geometry.setAttribute('position', new THREE.BufferAttribute(merged, 3));
  }

  private buildLayerObject(layer: LayerId, feats: Feature[], cm: CellMeshes): THREE.Object3D {
    const group = new THREE.Group();
    group.name = layer;
    const z = LAYER_Z[layer];
    if (layer === 'base') {
      for (const f of feats) {
        if (f.geom.type !== 'area') continue;
        const shape = new THREE.Shape(f.geom.points.map(([x, pz]) => new THREE.Vector2(x, -pz)));
        const geo = new THREE.ShapeGeometry(shape);
        geo.rotateX(-Math.PI / 2);
        const color = AREA_COLORS[f.geom.kind as AreaKind] ?? 0x4b5563;
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.92 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = z;
        mesh.userData.featureId = f.id;
        group.add(mesh);
        cm.pickMeshes.push(mesh);
      }
    } else if (layer === 'lane') {
      group.add(this.buildLineSegments(feats, z));
    } else {
      // 点图层:pile / sign / device
      const dot = this.buildDots(feats, layer, z);
      if (dot) {
        cm.dots = dot;
        group.add(dot);
      }
      const sym = new Map<PointKind, THREE.InstancedMesh>();
      const outs = new Map<PointKind, THREE.LineSegments>();
      const byKind = new Map<PointKind, Feature[]>();
      for (const f of feats) {
        if (f.geom.type !== 'point') continue;
        const k = f.kind as PointKind;
        const arr = byKind.get(k) ?? [];
        arr.push(f);
        byKind.set(k, arr);
      }
      for (const [kind, arr] of byKind) {
        const inst = this.buildSymbols(kind, arr, z);
        sym.set(kind, inst);
        group.add(inst);
        const outline = this.buildSymbolOutlines(kind, arr, z);
        if (outline) {
          outs.set(kind, outline);
          group.add(outline);
        }
      }
      cm.symbols = sym;
      cm.symbolOutlines = outs;
    }
    group.visible = false; // 默认由视口更新决定
    return group;
  }

  private buildLineSegments(feats: Feature[], y: number): THREE.LineSegments {
    const positions: number[] = [];
    const colors: number[] = [];
    const tmpColor = new THREE.Color();
    const lineFeats = feats.filter((f) => f.geom.type === 'line');
    for (const f of lineFeats) {
      if (f.geom.type !== 'line') continue;
      const c = LINE_COLORS[f.kind as LineKind] ?? 0xffffff;
      tmpColor.set(c);
      const pts = f.geom.points;
      for (let i = 0; i < pts.length - 1; i++) {
        positions.push(pts[i][0], y, pts[i][1], pts[i + 1][0], y, pts[i + 1][1]);
        colors.push(tmpColor.r, tmpColor.g, tmpColor.b, tmpColor.r, tmpColor.g, tmpColor.b);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const mat = new THREE.LineBasicMaterial({ vertexColors: true });
    const lines = new THREE.LineSegments(geo, mat);
    lines.userData.features = lineFeats;
    return lines;
  }

  private buildDots(feats: Feature[], layer: LayerId, y: number): THREE.InstancedMesh | undefined {
    const pts = feats.filter((f) => f.geom.type === 'point');
    if (!pts.length) return undefined;
    const geo = new THREE.CircleGeometry(0.55, 10);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: DOT_COLOR[layer] ?? 0xffffff });
    const inst = new THREE.InstancedMesh(geo, mat, pts.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    pts.forEach((f, i) => {
      if (f.geom.type !== 'point') return;
      m.compose(new THREE.Vector3(f.geom.x, y, f.geom.z), q, new THREE.Vector3(1, 1, 1));
      inst.setMatrixAt(i, m);
    });
    inst.instanceMatrix.needsUpdate = true;
    inst.userData.features = pts;
    return inst;
  }

  private buildSymbols(kind: PointKind, feats: Feature[], y: number): THREE.InstancedMesh {
    const geo = createSymbolGeometry(kind);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: KIND_COLOR[kind] });
    const inst = new THREE.InstancedMesh(geo, mat, feats.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    feats.forEach((f, i) => {
      if (f.geom.type !== 'point') return;
      const scale = (f.geom.size ?? 1) * 1.05;
      m.compose(
        new THREE.Vector3(f.geom.x, y + 0.01, f.geom.z),
        q,
        new THREE.Vector3(scale, scale, scale),
      );
      inst.setMatrixAt(i, m);
    });
    inst.instanceMatrix.needsUpdate = true;
    inst.userData.features = feats;
    return inst;
  }

  private buildSymbolOutlines(kind: PointKind, feats: Feature[], y: number): THREE.LineSegments | null {
    const base = createSymbolOutline(kind);
    if (!base) return null;
    base.rotateX(-Math.PI / 2);
    const positions: number[] = [];
    const src = base.attributes.position;
    const tmp = new THREE.Vector3();
    for (const f of feats) {
      if (f.geom.type !== 'point') continue;
      const scale = (f.geom.size ?? 1) * 1.05;
      for (let i = 0; i < src.count; i++) {
        tmp.fromBufferAttribute(src, i);
        positions.push(f.geom.x + tmp.x * scale, y + 0.02, f.geom.z + tmp.z * scale);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({ color: 0x1c1917 });
    return new THREE.LineSegments(geo, mat);
  }

  private buildHelpers() {
    // 高亮环(点选描边)
    const ringGeo = new THREE.RingGeometry(0.78, 1.0, 36);
    ringGeo.rotateX(-Math.PI / 2);
    this.highlight = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.95, side: THREE.DoubleSide }),
    );
    this.highlight.visible = false;
    this.scene.add(this.highlight);

    // 闪烁环(搜索定位)
    const blinkGeo = new THREE.RingGeometry(1.05, 1.3, 40);
    blinkGeo.rotateX(-Math.PI / 2);
    this.blinkRing = new THREE.Mesh(
      blinkGeo,
      new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.9, side: THREE.DoubleSide }),
    );
    this.blinkRing.visible = false;
    this.scene.add(this.blinkRing);

    // 框选矩形
    const rectGeo = new THREE.BufferGeometry();
    rectGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3));
    this.selectionRect = new THREE.Line(
      rectGeo,
      new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.9 }),
    );
    this.selectionRect.visible = false;
    this.scene.add(this.selectionRect);

    // 套索线
    const lassoGeo = new THREE.BufferGeometry();
    this.lassoLine = new THREE.Line(
      lassoGeo,
      new THREE.LineBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.95 }),
    );
    this.lassoLine.visible = false;
    this.scene.add(this.lassoLine);
  }

  // ============ 事件 ============
  private bindEvents() {
    const el = this.renderer.domElement;
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    el.addEventListener('pointerdown', this.onPointerDown);
    el.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    el.addEventListener('wheel', this.onWheel, { passive: false });
  }

  private onPointerDown = (e: PointerEvent) => {
    const s = useStore.getState();
    this.renderer.domElement.setPointerCapture(e.pointerId);
    const px = { x: e.offsetX, y: e.offsetY };
    this.dragStartPx = px;
    if (s.placementMode && e.button === 0) {
      const p = this.toWorld(e.offsetX, e.offsetY);
      this.cb.onPlace(p.x, p.z);
      this.dragMode = 'none';
      return;
    }
    if (e.button === 2 || e.button === 1) {
      this.dragMode = 'pan';
      this.panStart = { x: e.offsetX, y: e.offsetY, cx: this.camera.position.x, cz: this.camera.position.z };
    } else if (e.shiftKey) {
      this.dragMode = 'lasso';
      this.lassoPts = [];
      this.lassoLine.visible = true;
    } else {
      this.dragMode = 'box';
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.dragMode === 'pan' && this.panStart) {
      const dx = e.offsetX - this.panStart.x;
      const dy = e.offsetY - this.panStart.y;
      const scale = this.viewH / this.container.clientHeight;
      this.camera.position.x = this.panStart.cx - dx * scale;
      this.camera.position.z = this.panStart.cz - (-dy) * scale;
      this.camera.updateMatrixWorld();
      this.updateVisibility();
      return;
    }
    if (this.dragMode === 'box' && this.dragStartPx) {
      const a = this.toWorld(this.dragStartPx.x, this.dragStartPx.y);
      const b = this.toWorld(e.offsetX, e.offsetY);
      this.updateSelectionRect(a, b);
      return;
    }
    if (this.dragMode === 'lasso') {
      const p = this.toWorld(e.offsetX, e.offsetY);
      this.lassoPts.push([p.x, p.z]);
      this.lassoLine.geometry.setFromPoints(
        this.lassoPts.map(([x, z]) => new THREE.Vector3(x, 0.5, z)),
      );
      return;
    }
    // hover
    const id = this.pickAt(e.offsetX, e.offsetY);
    useStore.getState().setHover(id);
    this.renderer.domElement.style.cursor = id ? 'pointer' : 'default';
  };

  private onPointerUp = (e: PointerEvent) => {
    const mode = this.dragMode;
    this.dragMode = 'none';
    this.panStart = null;
    if (mode === 'box' && this.dragStartPx) {
      const moved = Math.hypot(e.offsetX - this.dragStartPx.x, e.offsetY - this.dragStartPx.y);
      this.selectionRect.visible = false;
      if (moved > 5) {
        const a = this.toWorld(this.dragStartPx.x, this.dragStartPx.y);
        const b = this.toWorld(e.offsetX, e.offsetY);
        const r = {
          minX: Math.min(a.x, b.x),
          maxX: Math.max(a.x, b.x),
          minZ: Math.min(a.z, b.z),
          maxZ: Math.max(a.z, b.z),
        };
        const ids = this.featuresInRect(r);
        this.cb.onBoxSelect(ids);
      } else {
        this.cb.onPick(this.pickAt(e.offsetX, e.offsetY));
      }
    } else if (mode === 'lasso') {
      this.lassoLine.visible = false;
      if (this.lassoPts.length >= 3) this.cb.onLassoSelect(this.featuresInLasso(this.lassoPts));
      this.lassoPts = [];
    }
    this.dragStartPx = null;
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const before = this.toWorld(e.offsetX, e.offsetY);
    const factor = e.deltaY > 0 ? 1.12 : 1 / 1.12;
    this.viewH = THREE.MathUtils.clamp(this.viewH * factor, 8, FIELD.depth * 1.4);
    this.applyFrustum();
    // 以鼠标位置为中心缩放
    const after = this.toWorld(e.offsetX, e.offsetY);
    this.camera.position.x += before.x - after.x;
    this.camera.position.z += before.z - after.z;
    this.camera.updateMatrixWorld();
    this.updateVisibility();
  };

  private applyFrustum() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const h = this.viewH;
    this.camera.top = h / 2;
    this.camera.bottom = -h / 2;
    this.camera.left = (-h * aspect) / 2;
    this.camera.right = (h * aspect) / 2;
    this.camera.updateProjectionMatrix();
    this.zoom = FIELD.depth / h;
  }

  fitAll() {
    this.viewH = FIELD.depth;
    this.camera.position.set(0, 200, 0);
    this.applyFrustum();
    this.updateVisibility();
  }

  focusOn(x: number, z: number) {
    this.camera.position.set(x, 200, z);
    if (this.viewH > 26) {
      this.viewH = 22;
      this.applyFrustum();
    }
    this.camera.updateMatrixWorld();
    this.updateVisibility();
  }

  private onResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    this.applyFrustum();
    this.updateVisibility();
  }

  // ============ 坐标换算与拾取 ============
  private toWorld(px: number, py: number): THREE.Vector3 {
    const ndc = new THREE.Vector2(
      (px / this.container.clientWidth) * 2 - 1,
      -(py / this.container.clientHeight) * 2 + 1,
    );
    this.raycaster.setFromCamera(ndc, this.camera);
    const t = (200 - this.camera.position.y) / (this.raycaster.ray.direction.y || -1);
    return this.raycaster.ray.origin.clone().addScaledVector(this.raycaster.ray.direction, t);
  }

  private currentLod(): 0 | 1 | 2 {
    if (this.viewH >= LOD0_H) return 0;
    if (this.viewH <= LOD2_H) return 2;
    return 1;
  }

  private pickAt(px: number, py: number): string | null {
    const s = useStore.getState();
    const world = this.toWorld(px, py);
    const tolM = (PICK_PX / this.container.clientHeight) * this.viewH;
    let best: { id: string; d: number } | null = null;
    const r = {
      minX: world.x - tolM,
      maxX: world.x + tolM,
      minZ: world.z - tolM,
      maxZ: world.z + tolM,
    };
    for (const cell of this.cells.values()) {
      if (!this.cellInView(cell)) continue;
      for (const id of cell.featureIds) {
        const f = s.featureMap.get(id);
        if (!f) continue;
        const eff = selectEffective(f, s);
        if (!eff.visible) continue;
        const b = boundsOf(f);
        if (b.maxX < r.minX || b.minX > r.maxX || b.maxZ < r.minZ || b.minZ > r.maxZ) continue;
        let d = Infinity;
        if (f.geom.type === 'point') {
          d = Math.hypot(f.geom.x - world.x, f.geom.z - world.z);
        } else if (f.geom.type === 'line') {
          d = this.distToLine(world.x, world.z, f.geom.points);
        } else {
          d = this.distToArea(world.x, world.z, f.geom.points);
        }
        if (d <= tolM && (!best || d < best.d)) best = { id, d };
      }
    }
    return best?.id ?? null;
  }

  private distToLine(x: number, z: number, pts: [number, number][]): number {
    let best = Infinity;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i];
      const [bx, bz] = pts[i + 1];
      const dx = bx - ax;
      const dz = bz - az;
      const len2 = dx * dx + dz * dz || 1e-9;
      let t = ((x - ax) * dx + (z - az) * dz) / len2;
      t = Math.max(0, Math.min(1, t));
      best = Math.min(best, Math.hypot(x - (ax + t * dx), z - (az + t * dz)));
    }
    return best;
  }

  private distToArea(x: number, z: number, pts: [number, number][]): number {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, zi] = pts[i];
      const [xj, zj] = pts[j];
      const hit = zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;
      if (hit) inside = !inside;
    }
    if (inside) return 0;
    return this.distToLine(x, z, [...pts, pts[0]]);
  }

  private featuresInRect(r: Rect): string[] {
    const s = useStore.getState();
    const ids = new Set<string>();
    for (const cell of this.cells.values()) {
      if (cell.bounds.maxX < r.minX || cell.bounds.minX > r.maxX) continue;
      if (cell.bounds.maxZ < r.minZ || cell.bounds.minZ > r.maxZ) continue;
      for (const id of cell.featureIds) {
        const f = s.featureMap.get(id);
        if (!f) continue;
        const eff = selectEffective(f, s);
        if (!eff.visible) continue;
        const b = boundsOf(f);
        if (b.maxX < r.minX || b.minX > r.maxX || b.maxZ < r.minZ || b.minZ > r.maxZ) continue;
        if (f.geom.type === 'point') {
          if (f.geom.x >= r.minX && f.geom.x <= r.maxX && f.geom.z >= r.minZ && f.geom.z <= r.maxZ) {
            ids.add(id);
          }
        } else {
          ids.add(id);
        }
      }
    }
    return [...ids];
  }

  private featuresInLasso(poly: [number, number][]): string[] {
    const s = useStore.getState();
    const inPoly = (x: number, z: number) => {
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, zi] = poly[i];
        const [xj, zj] = poly[j];
        const hit = zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;
        if (hit) inside = !inside;
      }
      return inside;
    };
    const ids: string[] = [];
    for (const cell of this.cells.values()) {
      for (const id of cell.featureIds) {
        const f = s.featureMap.get(id);
        if (!f) continue;
        const eff = selectEffective(f, s);
        if (!eff.visible) continue;
        if (f.geom.type === 'point') {
          if (inPoly(f.geom.x, f.geom.z)) ids.push(id);
        } else {
          const b = boundsOf(f);
          if (inPoly((b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2)) ids.push(id);
        }
      }
    }
    return [...new Set(ids)];
  }

  private updateSelectionRect(a: THREE.Vector3, b: THREE.Vector3) {
    const geo = this.selectionRect.geometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const vals = [
      a.x, 0.4, a.z,
      b.x, 0.4, a.z,
      b.x, 0.4, a.z,
      b.x, 0.4, b.z,
      b.x, 0.4, b.z,
      a.x, 0.4, b.z,
      a.x, 0.4, b.z,
      a.x, 0.4, a.z,
    ];
    for (let i = 0; i < vals.length; i += 3) {
      pos.setXYZ(i / 3, vals[i], vals[i + 1], vals[i + 2]);
    }
    pos.needsUpdate = true;
    this.selectionRect.visible = true;
  }

  // ============ 视口剔除与 LOD ============
  private cellInView(cell: CellMeshes): boolean {
    const b = cell.bounds;
    const v = this.viewRect();
    return !(b.maxX < v.minX || b.minX > v.maxX || b.maxZ < v.minZ || b.minZ > v.maxZ);
  }

  private viewRect(): Rect {
    const h = this.viewH;
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const w = h * aspect;
    return {
      minX: this.camera.position.x - w / 2,
      maxX: this.camera.position.x + w / 2,
      minZ: this.camera.position.z - h / 2,
      maxZ: this.camera.position.z + h / 2,
    };
  }

  private updateVisibility() {
    const s = useStore.getState();
    const lod = this.currentLod();
    let visibleCells = 0;
    let visibleFeats = 0;
    for (const cell of this.cells.values()) {
      const inView = this.cellInView(cell);
      if (!inView) {
        cell.outline.visible = false;
        for (const obj of Object.values(cell.layers)) obj.visible = false;
        continue;
      }
      visibleCells++;
      visibleFeats += cell.featureIds.length;
      // 图层级显隐:该 cell 中每个 layer object 按当前覆盖后是否仍有可见要素决定
      for (const [layer, obj] of Object.entries(cell.layers) as [LayerId, THREE.Object3D][]) {
        const layerOn = s.layerVisible[layer];
        if (!layerOn) {
          obj.visible = false;
          continue;
        }
        if (lod === 0) {
          obj.visible = false; // LOD0 只保留轮廓块
        } else {
          obj.visible = true;
          if (cell.dots) cell.dots.visible = lod === 1;
          if (cell.symbols) for (const m of cell.symbols.values()) m.visible = lod === 2;
          if (cell.symbolOutlines) for (const m of cell.symbolOutlines.values()) m.visible = lod === 2;
        }
      }
      cell.outline.visible = lod === 0;
    }
    this.updateLabels(lod);
  }

  /** 定时推送视口统计(静止时也刷新,保证 LOD/计数显示正确) */
  private emitStats() {
    const lod = this.currentLod();
    let visibleCells = 0;
    let visibleFeats = 0;
    for (const cell of this.cells.values()) {
      if (!this.cellInView(cell)) continue;
      visibleCells++;
      visibleFeats += cell.featureIds.length;
    }
    this.cb.onStats(lod, this.zoom, visibleCells, visibleFeats);
  }

  // ============ 文字标注(仅 LOD2,视口内、限量) ============
  private makeLabelTexture(text: string): THREE.Texture {
    const cached = this.labelTextureCache.get(text);
    if (cached) return cached;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const fontSize = 22;
    ctx.font = `600 ${fontSize}px "Microsoft YaHei", sans-serif`;
    const w = Math.ceil(ctx.measureText(text).width) + 12;
    canvas.width = w;
    canvas.height = 30;
    const c2 = canvas.getContext('2d')!;
    c2.font = `600 ${fontSize}px "Microsoft YaHei", sans-serif`;
    c2.fillStyle = 'rgba(17,20,26,0.82)';
    roundedRectPath(c2, 0, 0, w, 30, 6);
    c2.fill();
    c2.strokeStyle = 'rgba(255,255,255,0.35)';
    c2.stroke();
    c2.fillStyle = '#f8fafc';
    c2.textBaseline = 'middle';
    c2.fillText(text, 6, 16);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    this.labelTextureCache.set(text, tex);
    return tex;
  }

  private acquireSprite(): THREE.Sprite {
    const sp = this.labelPool.pop();
    if (sp) {
      sp.visible = true;
      return sp;
    }
    const mat = new THREE.SpriteMaterial({ transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.renderOrder = 50;
    this.labelGroup.add(sprite);
    this.labels.push(sprite);
    return sprite;
  }

  private updateLabels(lod: 0 | 1 | 2) {
    for (const sp of this.labels) sp.visible = false;
    this.labelPool.push(...this.labels);
    if (lod !== 2) return;
    const s = useStore.getState();
    const v = this.viewRect();
    const usedTexts = new Set<string>();
    const placed: [number, number][] = [];
    let used = 0;
    // 优先级:选中/闪烁要素 → 标志/设备文字标注 → 桩位编号
    const priority = new Set([...s.selectedIds, s.blinkId].filter(Boolean));
    const rank = (f: Feature) => {
      if (priority.has(f.id)) return 0;
      if (f.layer === 'sign') return 1;
      if (f.layer === 'device') return 2;
      return 3;
    };
    const candidates: Feature[] = [];
    for (const cell of this.cells.values()) {
      if (!this.cellInView(cell)) continue;
      for (const id of cell.featureIds) {
        const f = s.featureMap.get(id);
        if (!f || !f.label || f.geom.type !== 'point') continue;
        const eff = selectEffective(f, s);
        if (!eff.visible) continue;
        if (!priority.has(id) && (f.geom.x < v.minX || f.geom.x > v.maxX || f.geom.z < v.minZ || f.geom.z > v.maxZ)) continue;
        candidates.push(f);
      }
    }
    candidates.sort((a, b) => rank(a) - rank(b));
    for (const f of candidates) {
      if (used >= LABEL_CAP) break;
      if (usedTexts.has(f.label)) continue;
      if (f.geom.type !== 'point') continue;
      const fx = f.geom.x;
      const fz = f.geom.z;
      // 屏幕间距去重,避免标注叠字
      const tooClose = placed.some(([x, z]) => Math.hypot(x - fx, z - fz) < LABEL_MIN_GAP);
      if (tooClose && !priority.has(f.id)) continue;
      usedTexts.add(f.label);
      placed.push([fx, fz]);
      const sprite = this.acquireSprite();
      const tex = this.makeLabelTexture(f.label);
      (sprite.material as THREE.SpriteMaterial).map = tex;
      (sprite.material as THREE.SpriteMaterial).needsUpdate = true;
      const scale = 1.15;
      const aspect = tex.image.width / tex.image.height;
      sprite.scale.set(scale * aspect, scale, 1);
      sprite.position.set(fx, 1.2, fz - 1.4);
      used++;
    }
  }

  // ============ 摆放 / 提交结果 overlay ============
  setOverlayData(points: OverlayPoint[]) {
    this.clearOverlayGroup();
    const geo = new THREE.CircleGeometry(0.9, 16);
    geo.rotateX(-Math.PI / 2);
    for (const p of points) {
      const dot = new THREE.Mesh(geo, p.kind === 'work' ? this.overlayMatWork : this.overlayMatSubmit);
      dot.position.set(p.x, 1.0, p.z);
      dot.renderOrder = 61;
      this.overlayGroup.add(dot);
      if (p.kind === 'submit' && p.tx !== undefined && p.tz !== undefined) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(p.x, 0.9, p.z),
          new THREE.Vector3(p.tx, 0.9, p.tz),
        ]);
        this.overlayGroup.add(new THREE.Line(lineGeo, this.overlayLineMat));
      }
    }
  }

  private clearOverlayGroup() {
    for (const child of [...this.overlayGroup.children]) {
      this.overlayGroup.remove(child);
      if (child instanceof THREE.Mesh) child.geometry.dispose();
      if (child instanceof THREE.Line) child.geometry.dispose();
    }
  }

  // ============ 数据变化重建 ============
  queueRebuild() {
    if (this.rebuildQueued) return;
    this.rebuildQueued = true;
    requestAnimationFrame(() => {
      this.rebuildQueued = false;
      this.rebuild();
    });
  }

  private rebuild() {
    for (const cell of this.cells.values()) {
      for (const obj of Object.values(cell.layers)) {
        this.root.remove(obj);
        obj.traverse((o) => {
          if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) {
            o.geometry.dispose();
            if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
            else o.material.dispose();
          }
        });
      }
      this.root.remove(cell.outline);
      cell.outline.geometry.dispose();
      (cell.outline.material as THREE.Material).dispose();
    }
    this.cells.clear();
    this.buildCells();
    this.updateVisibility();
  }

  // ============ 高亮 / 闪烁 ============
  private updateHighlight() {
    const s = useStore.getState();
    const id = s.selectedIds[0] ?? null;
    if (!id) {
      this.highlight.visible = false;
      return;
    }
    const f = s.featureMap.get(id);
    if (!f || f.geom.type !== 'point') {
      this.highlight.visible = false;
      return;
    }
    this.highlight.visible = true;
    this.highlight.position.set(f.geom.x, 0.6, f.geom.z);
    // 环尺寸贴合符号外接半径(符号几何半径约 0.55,实例缩放 ×1.05)
    const base = (f.geom.size ?? 1) * 1.05 * 0.55 + 0.55;
    this.highlight.scale.setScalar(base);
  }

  private triggerBlink(id: string) {
    this.blinkId = id;
    this.blinkUntil = performance.now() + 3200;
    const f = useStore.getState().featureMap.get(id);
    if (f) this.focusOn(f.geom.type === 'point' ? f.geom.x : (boundsOf(f).minX + boundsOf(f).maxX) / 2, f.geom.type === 'point' ? f.geom.z : (boundsOf(f).minZ + boundsOf(f).maxZ) / 2);
  }

  // ============ 主循环 ============
  private tick() {
    const s = useStore.getState();
    const now = performance.now();
    // 数据版本变化(批量改图层/可见性)→ 重建 cell 归类
    const sig = `${s.sceneVersion}|${Object.values(s.layerVisible).join('')}|${Object.keys(s.overrides).length}`;
    if (sig !== this.lastStore) {
      const versionChanged = s.sceneVersion !== this.sceneVersion;
      this.lastStore = sig;
      this.sceneVersion = s.sceneVersion;
      if (versionChanged) this.queueRebuild();
      else this.updateVisibility();
    }
    // 视口统计:每 250ms 推送一次
    if (now - this.lastStatsEmit > 250) {
      this.lastStatsEmit = now;
      this.emitStats();
    }
    // 搜索闪烁信号(同一要素再次搜索也能重新触发)
    if (s.blinkId && s.blinkNonce !== this.blinkNonce) {
      this.blinkNonce = s.blinkNonce;
      this.triggerBlink(s.blinkId);
    }
    // 高亮
    this.updateHighlight();
    // 闪烁动画
    if (this.blinkId && performance.now() < this.blinkUntil) {
      const f = s.featureMap.get(this.blinkId);
      if (f && f.geom.type === 'point') {
        this.blinkRing.visible = true;
        const pulse = 1 + 0.3 * Math.sin(performance.now() / 130);
        const baseR = (f.geom.size ?? 1) * 1.05 * 0.55 + 0.7;
        this.blinkRing.position.set(f.geom.x, 0.8, f.geom.z);
        this.blinkRing.scale.setScalar(baseR * pulse);
        (this.blinkRing.material as THREE.MeshBasicMaterial).opacity =
          0.45 + 0.45 * Math.abs(Math.sin(performance.now() / 200));
      }
    } else {
      this.blinkRing.visible = false;
      this.blinkId = null;
    }
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObs.disconnect();
    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown', this.onPointerDown);
    el.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    el.removeEventListener('wheel', this.onWheel);
    this.renderer.dispose();
    el.remove();
  }
}
