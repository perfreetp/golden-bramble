import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  Vector3,
  Color3,
  Color4,
  MeshBuilder,
  Mesh,
  StandardMaterial,
  TransformNode,
  GizmoManager,
  type Node,
} from '@babylonjs/core';
import { GLTF2Export } from '@babylonjs/serializers';
import type { FieldState, ObstacleUnit } from '../types';
import { UNIT_LABELS } from '../types';
import {
  buildUnitMeshes,
  getUnitMaterial,
  buildBoundingBox,
  buildAnnotation,
  disposeNodeTree,
} from './unitMesh';
import { unitIncline, unitObstacleHeight, unitChannelWidth } from '../evaluation';
import { normAngle } from '../geometry';

interface UnitRuntime {
  root: TransformNode;
  bbox: Mesh;
  annotation: Mesh;
}

const TILE = 1000; // 网格块尺寸 mm —— 按块实例化渲染

/** 标注文案 */
function annotationLines(u: ObstacleUnit): string[] {
  const lines: string[] = [`H=${Math.round(u.size.h)}mm`];
  if (u.type === 'ramp') lines.unshift(`坡度 ${u.params.incline}°`);
  else if (u.type === 'steps') lines.unshift(`${u.params.stepCount}级`);
  else lines.unshift(`${UNIT_LABELS[u.type]}`);
  lines.push(`宽 ${Math.round(unitChannelWidth(u))}mm`);
  return lines;
}

export class CourseRenderer {
  readonly engine: Engine;
  readonly scene: Scene;
  private camera: ArcRotateCamera;
  private gizmo: GizmoManager;
  private fieldRoot: TransformNode;
  private gridMesh: Mesh | null = null;
  private units = new Map<string, UnitRuntime>();
  private field: FieldState;
  private wireframe = false;
  private selectedId: string | null = null;

  /** 学员/教师通过 Gizmo 改完单元后回调（数据回写 store） */
  onUnitEdited: ((unit: ObstacleUnit) => void) | null = null;
  onSelect: ((id: string | null) => void) | null = null;

  private downX = 0;
  private downY = 0;

  constructor(canvas: HTMLCanvasElement, field: FieldState) {
    this.field = field;
    this.engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.09, 0.11, 0.15, 1);

    this.camera = new ArcRotateCamera('cam', -Math.PI / 2.4, Math.PI / 3.2, 12000, new Vector3(0, 0, 0), this.scene);
    this.camera.attachControl(canvas, true);
    this.camera.wheelDeltaPercentage = 0.01;
    this.camera.minZ = 10;
    this.camera.maxZ = 200000;
    this.camera.lowerRadiusLimit = 1500;
    this.camera.upperRadiusLimit = 80000;
    this.camera.panningSensibility = 80;

    const hemi = new HemisphericLight('hemi', new Vector3(0, 1, 0), this.scene);
    hemi.intensity = 0.85;
    const dir = new DirectionalLight('dir', new Vector3(-0.5, -1, 0.4), this.scene);
    dir.intensity = 0.45;

    this.fieldRoot = new TransformNode('fieldRoot', this.scene);

    // Gizmo：位置 + Y 轴旋转 + 三轴尺寸
    this.gizmo = new GizmoManager(this.scene);
    this.gizmo.positionGizmoEnabled = true;
    this.gizmo.rotationGizmoEnabled = true;
    this.gizmo.scaleGizmoEnabled = true;
    this.gizmo.usePointerToAttachGizmos = false;
    const posGizmo = this.gizmo.gizmos.positionGizmo!;
    // IRotationGizmo 接口未暴露子轴开关，具体实现类 RotationGizmo 上才有
    const rotGizmo = this.gizmo.gizmos.rotationGizmo! as unknown as {
      xGizmoEnabled: boolean;
      zGizmoEnabled: boolean;
      snapDistance: number;
      onDragEndObservable: { add(cb: () => void): void };
    };
    posGizmo.snapDistance = 100;
    rotGizmo.xGizmoEnabled = false;
    rotGizmo.zGizmoEnabled = false;
    rotGizmo.snapDistance = Math.PI / 12; // 15° 吸附
    posGizmo.onDragEndObservable.add(() => this.finishTransform());
    rotGizmo.onDragEndObservable.add(() => this.finishTransform());
    this.gizmo.gizmos.scaleGizmo!.onDragEndObservable.add(() => this.finishTransform());

    this.bindPicking(canvas);
    this.rebuildField(field);

    this.engine.runRenderLoop(() => this.scene.render());
    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = () => this.engine.resize();

  /** 画布点选（区分点击与 Gizmo 拖拽） */
  private bindPicking(canvas: HTMLCanvasElement) {
    this.scene.onPointerDown = () => {
      this.downX = this.scene.pointerX;
      this.downY = this.scene.pointerY;
    };
    this.scene.onPointerUp = () => {
      if (Math.hypot(this.scene.pointerX - this.downX, this.scene.pointerY - this.downY) > 6) return;
      const pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (m) => m.isPickable);
      if (pick?.hit && pick.pickedMesh) {
        const id = pick.pickedMesh.metadata?.unitId as string | undefined;
        this.select(id ?? null);
      } else {
        this.select(null);
      }
    };
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  select(id: string | null) {
    this.selectedId = id;
    if (!id) {
      this.gizmo.attachToNode(null);
      this.onSelect?.(null);
      return;
    }
    const rt = this.units.get(id);
    const unit = this.field.units.find((u) => u.id === id);
    if (!rt || !unit) return;
    // 锁定单元不允许 Gizmo 编辑
    this.gizmo.attachToNode(unit.locked ? null : rt.root);
    this.onSelect?.(id);
  }

  get selectedUnitId() {
    return this.selectedId;
  }

  /** Gizmo 拖拽结束：把 TransformNode 的缩放烘焙回单元尺寸/参数并重建几何 */
  private finishTransform() {
    const node = this.gizmo.attachedNode as TransformNode | null;
    if (!node || !this.selectedId) return;
    const unit = this.field.units.find((u) => u.id === this.selectedId);
    if (!unit || unit.locked) return;

    unit.position = { x: node.position.x, z: node.position.z };
    unit.rotation = normAngle((node.rotation.y * 180) / Math.PI);

    const sc = node.scaling;
    if (Math.abs(sc.x - 1) > 1e-4 || Math.abs(sc.z - 1) > 1e-4 || Math.abs(sc.y - 1) > 1e-4) {
      unit.size = {
        w: Math.max(200, Math.round(unit.size.w * sc.x)),
        d: Math.max(200, Math.round(unit.size.d * sc.z)),
        h: Math.max(50, Math.round(unit.size.h * sc.y)),
      };
      this.bakeParamsFromSize(unit);
    }
    node.scaling.set(1, 1, 1);
    this.onUnitEdited?.(unit);
    // 几何与包围盒按新尺寸重建
    this.rebuildUnit(unit);
    this.gizmo.attachToNode(this.units.get(unit.id)!.root);
  }

  /** 尺寸改动后同步派生参数，保持参数表与几何一致 */
  private bakeParamsFromSize(u: ObstacleUnit) {
    switch (u.type) {
      case 'steps':
        u.params.stepHeight = Math.round(u.size.h / (u.params.stepCount ?? 1));
        u.params.stepDepth = Math.round(u.size.d / (u.params.stepCount ?? 1));
        break;
      case 'ramp':
        u.params.rampHeight = u.size.h;
        u.params.incline = Math.round((Math.atan2(u.size.h, u.size.d) * 180) / Math.PI * 10) / 10;
        break;
      case 'posts':
        u.params.postHeight = u.size.h;
        break;
      case 'bridge':
        u.params.bridgeHeight = Math.max(0, u.size.h - 60);
        break;
      case 'gravel':
        u.params.maxStoneSize = u.size.h;
        break;
    }
  }

  /** 场地网格：薄实例按块实例化，棋盘着色 */
  private buildGrid(field: FieldState) {
    this.gridMesh?.dispose();
    const nx = Math.ceil(field.config.length / TILE);
    const nz = Math.ceil(field.config.width / TILE);
    const tile = MeshBuilder.CreateGround('gridTile', { width: TILE * 0.96, height: TILE * 0.96 }, this.scene);
    const mat = new StandardMaterial('gridMat', this.scene);
    mat.specularColor = new Color3(0, 0, 0);
    tile.material = mat;

    const matrices: MatrixLike[] = [];
    const colors: Color4[] = [];
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < nz; j++) {
        const x = TILE / 2 + i * TILE;
        const z = TILE / 2 + j * TILE;
        matrices.push(composeMatrix(x, z));
        const dark = (i + j) % 2 === 0;
        colors.push(dark ? new Color4(0.16, 0.18, 0.22, 1) : new Color4(0.2, 0.22, 0.27, 1));
      }
    }
    tile.thinInstanceSetBuffer('matrix', Float32Array.from(matrices.flatMap((m) => m.m)), 16);
    tile.thinInstanceSetBuffer('color', Float32Array.from(colors.flatMap((c) => [c.r, c.g, c.b, c.a])), 4);
    tile.metadata = { export: true };
    this.gridMesh = tile;

    // 场地边界
    const border = MeshBuilder.CreateGround('fieldBorder', { width: field.config.length, height: field.config.width }, this.scene);
    border.position.set(field.config.length / 2, 0, field.config.width / 2);
    border.isVisible = false;
    border.metadata = { export: false };
  }

  /** 全量重建（新生成 / 重新生成） */
  rebuildField(field: FieldState) {
    this.field = field;
    this.buildGrid(field);
    [...this.units.keys()].forEach((id) => {
      const rt = this.units.get(id)!;
      disposeNodeTree(rt.root);
    });
    this.units.clear();
    for (const u of field.units) this.createUnit(u);
    this.applyWireframe();
    if (this.selectedId && this.units.has(this.selectedId)) this.select(this.selectedId);
  }

  /** 数据层单个单元变化后的局部重建 */
  rebuildUnit(unit: ObstacleUnit) {
    const rt = this.units.get(unit.id);
    if (rt) disposeNodeTree(rt.root);
    this.units.delete(unit.id);
    this.createUnit(unit);
    this.applyWireframe();
  }

  private createUnit(u: ObstacleUnit) {
    const root = new TransformNode(`root-${u.id}`, this.scene);
    root.metadata = { unitId: u.id };
    root.position.set(u.position.x, 0, u.position.z);
    root.rotation.y = (u.rotation * Math.PI) / 180;
    root.parent = this.fieldRoot;

    const meshes = buildUnitMeshes(u, this.scene);
    const mat = getUnitMaterial(u.type, u.locked, this.scene);
    for (const m of meshes) {
      m.setParent(root);
      m.material = mat;
      m.metadata = { unitId: u.id, export: true };
      m.isPickable = true;
    }
    const bbox = buildBoundingBox(u, this.scene);
    bbox.setParent(root);
    const annotation = buildAnnotation(u, annotationLines(u), this.scene);
    annotation.setParent(root);

    this.units.set(u.id, { root, bbox, annotation });
  }

  /** 线框模式：实体线框化 + 显示包围盒与坡度标注 */
  setWireframe(on: boolean) {
    this.wireframe = on;
    this.applyWireframe();
  }

  private applyWireframe() {
    for (const [id, rt] of this.units) {
      rt.root.getChildMeshes().forEach((m) => {
        if (m.metadata?.helper) {
          m.setEnabled(this.wireframe);
        } else if (m.material instanceof StandardMaterial) {
          m.material.wireframe = this.wireframe;
        }
      });
    }
  }

  /** 刷新全部标注文本（参数被面板修改后） */
  refreshAnnotations() {
    for (const [id, rt] of this.units) {
      const unit = this.field.units.find((u) => u.id === id)!;
      const oldTex = (rt.annotation.material as StandardMaterial).diffuseTexture;
      rt.annotation.dispose();
      const fresh = buildAnnotation(unit, annotationLines(unit), this.scene);
      fresh.setParent(rt.root);
      fresh.setEnabled(this.wireframe);
      rt.annotation = fresh;
      oldTex?.dispose();
    }
  }

  /** 导出 GLB：排除包围盒、标注等辅助节点（相机灯光序列化器默认不导出） */
  async exportGlb(filename: string): Promise<void> {
    const shouldExport = (node: Node) => {
      let n: Node | null = node;
      while (n) {
        if (n.metadata?.export === false || n.metadata?.helper) return false;
        n = n.parent;
      }
      return true;
    };
    const result = await GLTF2Export.GLBAsync(this.scene, filename, { shouldExportNode: shouldExport });
    result.downloadFiles();
  }

  frameCamera() {
    const f = this.field.config;
    this.camera.target.set(f.length / 2, 0, f.width / 2);
    this.camera.radius = Math.max(f.length, f.width) * 1.4;
  }

  dispose() {
    window.removeEventListener('resize', this.handleResize);
    this.gizmo.dispose();
    this.engine.dispose();
  }
}

interface MatrixLike {
  m: number[];
}

/** 平移薄实例矩阵（无旋转） */
function composeMatrix(x: number, z: number): MatrixLike {
  return {
    m: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, 0, z, 1,
    ],
  };
}
