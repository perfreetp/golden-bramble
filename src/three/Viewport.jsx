import { onMount, onCleanup, createEffect } from 'solid-js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  editor, setEditor, currentModel, voxVersion, notifyVoxels, showHint, cancelPaste,
} from '../state/store';
import { PALETTE } from '../state/palette';
import { key, applyEdit, pastePlacements } from '../voxel/ops';

export default function Viewport() {
  let container;
  let renderer, scene, camera, controls;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const dummy = new THREE.Object3D();
  const tmpColor = new THREE.Color();

  let curMesh = null, othMesh = null, ghostMesh = null;
  let planeMesh = null, gridLines = null, boundsBox = null, hoverBox = null, selBox = null;
  let capacity = 0;
  let painting = false, selecting = false, selStart = null, lastCellKey = '';
  let lastModelId = null;
  let raf = 0;

  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const matCur = new THREE.MeshLambertMaterial({});
  const matOth = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0.25 });
  const matGhost = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0.6, depthWrite: false });

  function ensureCapacity(n) {
    if (n <= capacity && curMesh) return;
    capacity = Math.max(n, 1024);
    for (const m of [curMesh, othMesh, ghostMesh]) {
      if (m) { scene.remove(m); m.dispose(); }
    }
    curMesh = new THREE.InstancedMesh(boxGeo, matCur, capacity);
    othMesh = new THREE.InstancedMesh(boxGeo, matOth, capacity);
    ghostMesh = new THREE.InstancedMesh(boxGeo, matGhost, capacity);
    curMesh.count = 0; othMesh.count = 0; ghostMesh.count = 0;
    curMesh.frustumCulled = othMesh.frustumCulled = ghostMesh.frustumCulled = false;
    scene.add(curMesh, othMesh, ghostMesh);
  }

  function rebuildVoxels() {
    const m = currentModel();
    if (!m || !curMesh) return;
    const s = m.cellMm;
    let iCur = 0, iOth = 0;
    for (const [k, c] of m.voxels) {
      const [x, y, z] = k.split(',').map(Number);
      const isCur = z === editor.currentZ;
      if (editor.solo && !isCur) continue;
      dummy.position.set((x + 0.5) * s, (z + 0.5) * s, (y + 0.5) * s);
      dummy.scale.setScalar(s * 0.92);
      dummy.updateMatrix();
      const hex = PALETTE[c] ? PALETTE[c].hex : '#999999';
      if (isCur) {
        curMesh.setMatrixAt(iCur, dummy.matrix);
        curMesh.setColorAt(iCur, tmpColor.set(hex));
        iCur++;
      } else {
        othMesh.setMatrixAt(iOth, dummy.matrix);
        othMesh.setColorAt(iOth, tmpColor.set(hex));
        iOth++;
      }
    }
    curMesh.count = iCur;
    othMesh.count = iOth;
    curMesh.instanceMatrix.needsUpdate = true;
    othMesh.instanceMatrix.needsUpdate = true;
    if (curMesh.instanceColor) curMesh.instanceColor.needsUpdate = true;
    if (othMesh.instanceColor) othMesh.instanceColor.needsUpdate = true;
  }

  function makeGridLines(nx, ny, s) {
    const pts = [];
    for (let i = 0; i <= nx; i++) pts.push(i * s, 0, 0, i * s, 0, ny * s);
    for (let j = 0; j <= ny; j++) pts.push(0, 0, j * s, nx * s, 0, j * s);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x3a4150 }));
  }

  function rebuildStatic() {
    const m = currentModel();
    if (!m) return;
    const s = m.cellMm;
    if (planeMesh) { scene.remove(planeMesh); planeMesh.geometry.dispose(); planeMesh.material.dispose(); }
    planeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(m.nx * s, m.ny * s),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    planeMesh.rotation.x = -Math.PI / 2;
    scene.add(planeMesh);

    if (gridLines) { scene.remove(gridLines); gridLines.geometry.dispose(); gridLines.material.dispose(); }
    gridLines = makeGridLines(m.nx, m.ny, s);
    scene.add(gridLines);

    if (boundsBox) { scene.remove(boundsBox); boundsBox.dispose(); }
    boundsBox = new THREE.Box3Helper(
      new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(m.nx * s, m.nz * s, m.ny * s)),
      0x4a5265
    );
    scene.add(boundsBox);
    updateLayer();
  }

  function updateLayer() {
    const m = currentModel();
    if (!m || !planeMesh) return;
    const s = m.cellMm;
    planeMesh.position.set((m.nx * s) / 2, (editor.currentZ + 1) * s, (m.ny * s) / 2);
    gridLines.position.set(0, editor.currentZ * s + 0.02, 0);
  }

  function fitCamera(m) {
    const s = m.cellMm;
    const cx = (m.nx * s) / 2, cy = (m.nz * s) / 2, cz = (m.ny * s) / 2;
    const r = Math.max(m.nx, m.ny, m.nz) * s;
    camera.position.set(cx + r * 1.1, cy + r * 1.2, cz + r * 1.4);
    camera.near = Math.max(0.5, r / 100);
    camera.far = r * 30;
    camera.updateProjectionMatrix();
    controls.target.set(cx, cy, cz);
    controls.update();
  }

  function updateSelBox() {
    const m = currentModel();
    if (!m || !editor.selection || !selBox) { if (selBox) selBox.visible = false; return; }
    const s = m.cellMm, sel = editor.selection;
    const z0 = Math.min(editor.selZ0, editor.selZ1), z1 = Math.max(editor.selZ0, editor.selZ1);
    selBox.visible = true;
    selBox.box.min.set(sel.x0 * s, z0 * s, sel.y0 * s);
    selBox.box.max.set((sel.x1 + 1) * s, (z1 + 1) * s, (sel.y1 + 1) * s);
  }

  function rebuildGhost() {
    if (!ghostMesh) return;
    const m = currentModel();
    if (!m || !editor.pasteActive || !editor.clipboard || !editor.pasteAnchor) {
      ghostMesh.count = 0;
      return;
    }
    const { placements } = pastePlacements(m, editor.clipboard, editor.pasteAnchor, editor.mirrorX, editor.mirrorY);
    const s = m.cellMm;
    let i = 0;
    for (const p of placements) {
      if (i >= capacity) break;
      dummy.position.set((p.x + 0.5) * s, (p.z + 0.5) * s, (p.y + 0.5) * s);
      dummy.scale.setScalar(s * 0.92);
      dummy.updateMatrix();
      ghostMesh.setMatrixAt(i, dummy.matrix);
      ghostMesh.setColorAt(i, tmpColor.set(p.conflict ? '#e5484d' : '#46c26a'));
      i++;
    }
    ghostMesh.count = i;
    ghostMesh.instanceMatrix.needsUpdate = true;
    if (ghostMesh.instanceColor) ghostMesh.instanceColor.needsUpdate = true;
  }

  // ---------- 拾取 ----------
  function pickCell(e) {
    const m = currentModel();
    if (!m || !planeMesh) return null;
    const r = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(planeMesh, false)[0];
    if (!hit) return null;
    const s = m.cellMm;
    return {
      x: Math.max(0, Math.min(m.nx - 1, Math.floor(hit.point.x / s))),
      y: Math.max(0, Math.min(m.ny - 1, Math.floor(hit.point.z / s))),
      z: editor.currentZ,
    };
  }

  function paintAt(cell) {
    const k = cell.x + ',' + cell.y + ',' + cell.z;
    if (k === lastCellKey) return;
    lastCellKey = k;
    const m = currentModel();
    if (!m) return;
    applyEdit(m, cell.x, cell.y, cell.z, editor.mode, editor.color, editor.mirrorX, editor.mirrorY);
    notifyVoxels();
  }

  function confirmPaste(anchorCell) {
    const m = currentModel();
    const clip = editor.clipboard;
    if (!m || !clip) return;
    const anchor = { x: anchorCell.x, y: anchorCell.y, z: editor.currentZ };
    const { placements, hasConflict } = pastePlacements(m, clip, anchor, editor.mirrorX, editor.mirrorY);
    if (hasConflict) {
      showHint('落点存在占用冲突（红色格），无法落下', 'error');
      return;
    }
    for (const p of placements) m.voxels.set(key(p.x, p.y, p.z), p.c);
    notifyVoxels();
    showHint(`已粘贴 ${placements.length} 个体素`, 'ok');
  }

  // ---------- 事件 ----------
  function onPointerDown(e) {
    if (e.button !== 0) return;
    const cell = pickCell(e);
    if (editor.pasteActive) {
      if (cell) confirmPaste(cell);
      return;
    }
    if (!cell) return;
    if (editor.mode === 'select') {
      selecting = true;
      selStart = cell;
      setEditor('selZ0', cell.z);
      setEditor('selZ1', cell.z);
      setEditor('selection', { x0: cell.x, y0: cell.y, x1: cell.x, y1: cell.y });
    } else {
      painting = true;
      lastCellKey = '';
      paintAt(cell);
    }
    renderer.domElement.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    const cell = pickCell(e);
    const m = currentModel();
    if (hoverBox) {
      if (cell && m && !editor.pasteActive) {
        const s = m.cellMm;
        hoverBox.visible = true;
        hoverBox.position.set((cell.x + 0.5) * s, (cell.z + 0.5) * s, (cell.y + 0.5) * s);
        hoverBox.scale.setScalar(s);
      } else {
        hoverBox.visible = false;
      }
    }
    if (editor.pasteActive) {
      if (cell) setEditor('pasteAnchor', { x: cell.x, y: cell.y, z: cell.z });
      return;
    }
    if (!cell) return;
    if (painting) paintAt(cell);
    else if (selecting && selStart) {
      setEditor('selection', {
        x0: Math.min(selStart.x, cell.x),
        y0: Math.min(selStart.y, cell.y),
        x1: Math.max(selStart.x, cell.x),
        y1: Math.max(selStart.y, cell.y),
      });
    }
  }

  function onPointerUp() {
    painting = false;
    selecting = false;
    selStart = null;
  }

  function onContextMenu(e) {
    e.preventDefault();
    if (editor.pasteActive) cancelPaste();
  }

  function onKeyDown(e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'Escape') {
      if (editor.pasteActive) cancelPaste();
      else setEditor('selection', null);
    }
  }

  onMount(() => {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color('#16181d');
    camera = new THREE.PerspectiveCamera(45, 1, 1, 20000);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.mouseButtons = { LEFT: null, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.ROTATE };
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x39404e, 1.15));
    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
    dir.position.set(1, 1.6, 0.8);
    scene.add(dir);
    const dir2 = new THREE.DirectionalLight(0xffffff, 0.5);
    dir2.position.set(-1, 0.6, -0.9);
    scene.add(dir2);

    hoverBox = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
      new THREE.LineBasicMaterial({ color: 0xffd166 })
    );
    hoverBox.visible = false;
    scene.add(hoverBox);

    selBox = new THREE.Box3Helper(new THREE.Box3(), 0x4f9fd8);
    selBox.visible = false;
    scene.add(selBox);

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('keydown', onKeyDown);

    function loop() {
      raf = requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene, camera);
    }
    loop();

    // ---- 响应式联动 ----
    createEffect(() => {
      const m = currentModel();
      if (!m) return;
      m.nx; m.ny; m.nz; m.cellMm; // 跟踪尺寸变化
      ensureCapacity(m.nx * m.ny * m.nz);
      rebuildStatic();
      if (lastModelId !== m.id) {
        lastModelId = m.id;
        fitCamera(m);
        if (editor.currentZ >= m.nz) setEditor('currentZ', 0);
      }
      rebuildVoxels();
    });
    createEffect(() => {
      voxVersion(); editor.currentZ; editor.solo;
      rebuildVoxels();
    });
    createEffect(() => {
      editor.currentZ;
      updateLayer();
    });
    createEffect(() => {
      editor.selection; editor.selZ0; editor.selZ1;
      updateSelBox();
    });
    createEffect(() => {
      editor.pasteActive; editor.pasteAnchor; editor.clipboard; editor.mirrorX; editor.mirrorY; voxVersion();
      rebuildGhost();
    });

    onCleanup(() => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    });
  });

  return <div class="viewport" ref={container} />;
}
