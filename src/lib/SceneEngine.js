import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { getModel, getTypeDef } from './catalog.js'
import {
  makeOBB, obbIntersect2D, gapsBetween, checkPlacement, EPS
} from './rules.js'
import {
  instances as instStore, selected as selStore, room as roomStore,
  viewMode as viewStore, showDimensions as dimStore,
  liveConflicts, flashReject
} from './stores.js'

const POS_STEP = 0.1
const ROT_STEP = Math.PI / 12 // 15°
const COLORS = {
  selected: 0xffc107,
  conflict: 0xe53935,
  gridMinor: 0xd7dee6,
  gridMajor: 0x9aa7b4,
  boundary: 0x455a64,
  ruler: 0x37474f
}

// ---------- Canvas 文字 Sprite ----------
function makeTextSprite(text, { color = '#263238', bg = 'rgba(255,255,255,0.85)', scale = 0.28 } = {}) {
  const pad = 8
  const font = '42px "Microsoft YaHei", "PingFang SC", sans-serif'
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d')
  ctx.font = font
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2
  const h = 58
  c.width = w; c.height = h
  ctx.font = font
  ctx.fillStyle = bg
  roundRect(ctx, 0, 0, w, h, 10); ctx.fill()
  ctx.fillStyle = color
  ctx.textBaseline = 'middle'
  ctx.fillText(text, pad, h / 2 + 2)
  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 4
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true })
  const sp = new THREE.Sprite(mat)
  const ratio = w / h
  sp.scale.set(scale * ratio, scale, 1)
  sp.renderOrder = 999
  sp.userData.dispose = () => { tex.dispose(); mat.dispose() }
  return sp
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export class SceneEngine {
  constructor(container) {
    this.container = container
    this.groups = new Map()      // instId -> THREE.Group
    this.pickMeshes = []
    this.conflictIds = new Set()
    this.unsubs = []
    this.gesture = null
    this.marquee = null
    this._snapshot = null

    this.initRenderer()
    this.initScene()
    this.initCameras()
    this.initLights()
    this.buildGizmo()
    this.bindPointer()
    this.bindStores()
    this._onDrop = e => this.handleLibraryDrop(e)
    window.addEventListener('psle-drop', this._onDrop)
    this.resize()
    this.animate = this.animate.bind(this)
    this.raf = requestAnimationFrame(this.animate)
  }

  // ---------- 渲染器 ----------
  initRenderer() {
    const canvas = document.createElement('canvas')
    const gl2 = canvas.getContext('webgl2')
    if (!gl2) {
      this.container.innerHTML =
        '<div style="padding:40px;color:#b00020;font-family:sans-serif">当前浏览器不支持 WebGL2，无法启动三维编辑器。</div>'
      throw new Error('WebGL2 unavailable')
    }
    this.renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    })
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.container.appendChild(canvas)
    // 尺寸调整推迟到相机初始化之后（构造末尾统一调用）
    new ResizeObserver(() => this.resize()).observe(this.container)
  }

  initScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xf4f6f8)
    this.roomGroup = new THREE.Group()
    this.equipGroup = new THREE.Group()
    this.overlayGroup = new THREE.Group()   // 俯视尺寸标注
    this.scene.add(this.roomGroup, this.equipGroup, this.overlayGroup)
  }

  initCameras() {
    const r = roomStore
    const rm = this.currentRoom()
    this.perspCam = new THREE.PerspectiveCamera(50, 1, 0.1, 200)
    this.topCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200)
    this.placeCameras()

    this.perspCtrl = new OrbitControls(this.perspCam, this.renderer.domElement)
    this.perspCtrl.enableDamping = true
    this.perspCtrl.maxPolarAngle = Math.PI * 0.48
    this.perspCtrl.minPolarAngle = Math.PI * 0.15
    // 左键交给编辑器(拾取/框选/手柄)，右键旋转、中键缩放
    this.perspCtrl.mouseButtons = {
      LEFT: null, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE
    }
    this.perspCtrl.touches = {
      ONE: null, TWO: THREE.TOUCH.DOLLY_ROTATE
    }

    this.topCtrl = new OrbitControls(this.topCam, this.renderer.domElement)
    this.topCtrl.enableRotate = false
    this.topCtrl.enableDamping = true
    this.topCtrl.screenSpacePanning = true
    this.topCtrl.mouseButtons = {
      LEFT: null, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN
    }
    this.topCtrl.touches = { ONE: null, TWO: THREE.TOUCH.DOLLY_PAN }
    this.topCtrl.enabled = false
    this.controls = this.perspCtrl
    this.camera = this.perspCam
    // 阻止左键 contextmenu 之外的默认行为由编辑器全权处理
    this.renderer.domElement.addEventListener('contextmenu', e => e.preventDefault())
  }

  currentRoom() {
    let rm = { L: 8, W: 6 }
    roomStore.subscribe(v => { rm = v })()
    return rm
  }

  placeCameras() {
    const rm = this.currentRoom()
    const cx = rm.L / 2, cz = rm.W / 2
    const dist = Math.max(rm.L, rm.W) * 1.15
    this.perspCam.position.set(cx + dist, dist * 0.95, cz + dist)
    this.perspCam.lookAt(cx, 0, cz)
    this.perspCtrl?.target.set(cx, 0, cz)
    this.topCam.position.set(cx, 20, cz)
    this.topCam.up.set(0, 0, -1)
    this.topCam.lookAt(cx, 0, cz)
    this.topCtrl?.target.set(cx, 0, cz)
    this.fitTop()
  }

  fitTop() {
    const rm = this.currentRoom()
    const aspect = (this.container.clientWidth || 1) / (this.container.clientHeight || 1)
    const margin = 1.15
    const viewW = rm.L * margin
    const viewH = rm.W * margin
    let halfW, halfH
    if (viewW / viewH > aspect) { halfW = viewW / 2; halfH = halfW / aspect }
    else { halfH = viewH / 2; halfW = halfH * aspect }
    this.topCam.left = -halfW; this.topCam.right = halfW
    this.topCam.top = halfH; this.topCam.bottom = -halfH
    this.topCam.updateProjectionMatrix()
  }

  initLights() {
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xc8d2dc, 0.95))
    const sun = new THREE.DirectionalLight(0xffffff, 1.1)
    sun.position.set(6, 12, 4)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -12; sun.shadow.camera.right = 12
    sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -12
    this.scene.add(sun)
  }

  resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight
    if (!w || !h || !this.perspCam) return
    this.renderer.setSize(w, h, false)
    this.perspCam.aspect = w / h
    this.perspCam.updateProjectionMatrix()
    this.fitTop()
  }

  // ---------- 场地:地面网格 + 边界 + 标尺 ----------
  buildRoom(rm) {
    disposeGroup(this.roomGroup)
    const { L, W } = rm

    // 地面
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(L, W),
      new THREE.MeshStandardMaterial({ color: 0xeef1f4, roughness: 0.95 })
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.set(L / 2, -0.002, W / 2)
    floor.receiveShadow = true
    floor.userData.isFloor = true
    this.roomGroup.add(floor)
    this.floorMesh = floor

    // 自定义矩形网格:0.5m 次线,1m 主线
    const minor = [], major = []
    for (let x = 0; x <= L + EPS; x += 0.5) {
      const arr = Math.abs(x - Math.round(x)) < EPS ? major : minor
      arr.push(x, 0.001, 0, x, 0.001, W)
    }
    for (let z = 0; z <= W + EPS; z += 0.5) {
      const arr = Math.abs(z - Math.round(z)) < EPS ? major : minor
      arr.push(0, 0.001, z, L, 0.001, z)
    }
    const minorGeo = new THREE.BufferGeometry()
    minorGeo.setAttribute('position', new THREE.Float32BufferAttribute(minor, 3))
    const majorGeo = new THREE.BufferGeometry()
    majorGeo.setAttribute('position', new THREE.Float32BufferAttribute(major, 3))
    this.roomGroup.add(
      new THREE.LineSegments(minorGeo, new THREE.LineBasicMaterial({ color: COLORS.gridMinor })),
      new THREE.LineSegments(majorGeo, new THREE.LineBasicMaterial({ color: COLORS.gridMajor }))
    )

    // 边界墙脚(四条低矮色带)
    const wallMat = new THREE.MeshStandardMaterial({ color: COLORS.boundary, roughness: 0.7 })
    const t = 0.08, h = 0.12
    const walls = [
      [L + t * 2, t, L / 2, -t / 2],
      [L + t * 2, t, L / 2, W + t / 2],
      [t, W + t * 2, -t / 2, W / 2],
      [t, W + t * 2, L + t / 2, W / 2]
    ]
    for (const [sx, sz, x, z] of walls) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, h, sz), wallMat)
      m.position.set(x, h / 2, z)
      this.roomGroup.add(m)
    }

    // 标尺:沿 z=0 边标 X,沿 x=0 边标 Z,每 1 米
    for (let x = 0; x <= L + EPS; x += 1) {
      const tick = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.02, 0.18),
        new THREE.MeshBasicMaterial({ color: COLORS.ruler })
      )
      tick.position.set(x, 0.01, -0.16)
      this.roomGroup.add(tick)
      const sp = makeTextSprite(`${x}m`, { scale: 0.22, color: '#37474f', bg: 'rgba(255,255,255,0.7)' })
      sp.position.set(x, 0.02, -0.42)
      this.roomGroup.add(sp)
    }
    for (let z = 0; z <= W + EPS; z += 1) {
      const tick = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.02, 0.015),
        new THREE.MeshBasicMaterial({ color: COLORS.ruler })
      )
      tick.position.set(-0.16, 0.01, z)
      this.roomGroup.add(tick)
      const sp = makeTextSprite(`${z}m`, { scale: 0.22, color: '#37474f', bg: 'rgba(255,255,255,0.7)' })
      sp.position.set(-0.42, 0.02, z)
      this.roomGroup.add(sp)
    }
    const nameSp = makeTextSprite(`场地 ${L}m × ${W}m`, { scale: 0.3, color: '#0d47a1' })
    nameSp.position.set(L / 2, 0.02, -0.62)
    this.roomGroup.add(nameSp)

    this.placeCameras()
  }

  // ---------- 器材建模 ----------
  makeEquipGroup(inst) {
    const model = getModel(inst.type, inst.modelId)
    const def = getTypeDef(inst.type)
    const g = new THREE.Group()
    g.userData.instId = inst.id
    const mats = []
    const mat = (color, extra = {}) => {
      const m = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1, ...extra })
      mats.push(m); return m
    }
    const add = (mesh) => { mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh); return mesh }
    const { L, W, H } = model

    if (inst.type === 'pool' || inst.type === 'treadmill') {
      const wall = 0.08
      const wallMat = mat(inst.type === 'pool' ? 0x4dd0e1 : 0x90a4ae)
      const base = new THREE.Mesh(new THREE.BoxGeometry(L, 0.1, W), wallMat)
      base.position.y = 0.05; add(base)
      const side1 = new THREE.Mesh(new THREE.BoxGeometry(wall, H, W), wallMat)
      side1.position.set(-L / 2 + wall / 2, H / 2, 0); add(side1)
      const side2 = side1.clone(); side2.position.x = L / 2 - wall / 2; add(side2)
      const end1 = new THREE.Mesh(new THREE.BoxGeometry(L, H, wall), wallMat)
      end1.position.set(0, H / 2, -W / 2 + wall / 2); add(end1)
      const end2 = end1.clone(); end2.position.z = W / 2 - wall / 2; add(end2)
      // 水面
      const water = new THREE.Mesh(
        new THREE.PlaneGeometry(L - wall * 2, W - wall * 2),
        new THREE.MeshPhysicalMaterial({
          color: 0x29b6f6, transparent: true, opacity: 0.55,
          roughness: 0.15, metalness: 0, transmission: 0.15
        })
      )
      water.rotation.x = -Math.PI / 2
      water.position.y = H - (model.depth ? H - model.depth : 0.2)
      add(water)
      if (inst.type === 'treadmill') {
        const belt = new THREE.Mesh(
          new THREE.BoxGeometry(L * 0.7, 0.05, W * 0.55),
          mat(0x263238, { roughness: 0.9 })
        )
        belt.position.y = 0.15; add(belt)
      }
    } else if (inst.type === 'ramp') {
      // 三角棱柱楔形坡道
      const shape = new THREE.Shape()
      shape.moveTo(-L / 2, 0); shape.lineTo(L / 2, 0)
      shape.lineTo(L / 2, H); shape.lineTo(-L / 2, 0)
      const geo = new THREE.ExtrudeGeometry(shape, { depth: W, bevelEnabled: false })
      geo.translate(0, 0, -W / 2)
      const ramp = new THREE.Mesh(geo, mat(0xffb74d, { roughness: 0.75 }))
      add(ramp)
    } else if (inst.type === 'mat') {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(L, H, W),
        mat(0x66bb6a, { roughness: 0.95 })
      )
      m.position.y = H / 2; add(m)
    } else if (inst.type === 'fence') {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(L, 0.06, W), mat(0x8d6e63))
      rail.position.y = H; add(rail)
      const lowRail = new THREE.Mesh(new THREE.BoxGeometry(L, 0.05, W), mat(0xa1887f))
      lowRail.position.y = H * 0.45; add(lowRail)
      const postGeo = new THREE.CylinderGeometry(0.035, 0.035, H, 12)
      const postMat = mat(0x6d4c41)
      const n = Math.max(2, Math.round(L) + 1)
      for (let i = 0; i < n; i++) {
        const p = new THREE.Mesh(postGeo, postMat)
        p.position.set(-L / 2 + (L * i) / (n - 1), H / 2, 0)
        add(p)
      }
    } else if (inst.type === 'post') {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(W / 2, W / 2, H, 16), mat(0x78909c, { metalness: 0.4 }))
      pole.position.y = H / 2; add(pole)
      const cap = new THREE.Mesh(new THREE.SphereGeometry(W / 1.6, 16, 12), mat(0xef5350, { metalness: 0.3 }))
      cap.position.y = H; add(cap)
      const base = new THREE.Mesh(new THREE.CylinderGeometry(W * 0.9, W * 0.9, 0.04, 16), mat(0x546e7a))
      base.position.y = 0.02; add(base)
    }

    // OBB 描边框
    const boxGeo = new THREE.BoxGeometry(model.L, model.H, model.W)
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(boxGeo),
      new THREE.LineBasicMaterial({ color: COLORS.selected })
    )
    edges.position.y = model.H / 2
    edges.visible = false
    g.add(edges)
    g.userData.edges = edges
    g.userData.mats = mats
    g.userData.sig = `${inst.type}|${inst.modelId}|${inst.scale}`
    return g
  }

  // ---------- 数据 -> 场景 同步 ----------
  syncInstances(list) {
    const seen = new Set()
    for (const inst of list) {
      seen.add(inst.id)
      let g = this.groups.get(inst.id)
      const sig = `${inst.type}|${inst.modelId}|${inst.scale}`
      if (!g) {
        g = this.makeEquipGroup(inst)
        this.equipGroup.add(g)
        this.groups.set(inst.id, g)
      } else if (g.userData.sig !== sig) {
        this.equipGroup.remove(g)
        disposeGroup(g)
        g = this.makeEquipGroup(inst)
        this.equipGroup.add(g)
        this.groups.set(inst.id, g)
      }
      g.position.set(inst.x, inst.y, inst.z)
      g.rotation.y = inst.rotY
      g.scale.setScalar(inst.scale)
    }
    for (const [id, g] of this.groups) {
      if (!seen.has(id)) {
        this.equipGroup.remove(g)
        disposeGroup(g)
        this.groups.delete(id)
      }
    }
    this.pickMeshes = []
    for (const g of this.groups.values()) {
      g.traverse(o => { if (o.isMesh) { o.userData.instId = g.userData.instId; this.pickMeshes.push(o) } })
    }
    this.updateConflicts(list)
    this.updateHighlight()
    this.rebuildOverlay(list)
    this.updateGizmo()
  }

  updateConflicts(list) {
    const ids = new Set()
    for (const inst of list) {
      const { conflicts } = checkPlacement(inst, list.filter(i => i.id !== inst.id), this.currentRoom())
      if (conflicts.size) {
        for (const c of conflicts) {
          if (c !== '__bounds__') ids.add(c)
          ids.add(inst.id)
        }
      }
    }
    this.conflictIds = ids
    liveConflicts.set(ids)
  }

  updateHighlight() {
    const sel = this._selected || new Set()
    for (const [id, g] of this.groups) {
      const edges = g.userData.edges
      const isConflict = this.conflictIds.has(id)
      const isSel = sel.has(id)
      for (const m of g.userData.mats) {
        m.emissive.setHex(isConflict ? COLORS.conflict : isSel ? COLORS.selected : 0x000000)
        m.emissiveIntensity = isConflict ? 0.55 : isSel ? 0.35 : 0
      }
      edges.visible = isConflict || isSel
      edges.material.color.setHex(isConflict ? COLORS.conflict : COLORS.selected)
    }
  }

  // ---------- 俯视尺寸/间距标注 ----------
  rebuildOverlay(list) {
    disposeGroup(this.overlayGroup)
    if (!this._showDim || this._viewMode !== 'top' || !list.length) return
    const obbs = list.map(makeOBB)
    const lineMat = new THREE.LineBasicMaterial({ color: 0x1565c0, depthTest: false })
    const y = 0.03

    for (const o of obbs) {
      const m = getModel(o.inst.type, o.inst.modelId)
      const [p0, p1, p2, p3] = o.corners
      // 长边 L(局部 X):在 p0-p1 外侧;宽 W(局部 Z):p0-p3 外侧
      const off = 0.18
      const drawDim = (a, b, text) => {
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(a.x, y, a.z), new THREE.Vector3(b.x, y, b.z)
        ])
        this.overlayGroup.add(new THREE.Line(geo, lineMat))
        const sp = makeTextSprite(text, { scale: 0.24, color: '#0d47a1' })
        sp.position.set((a.x + b.x) / 2, y + 0.01, (a.z + b.z) / 2)
        this.overlayGroup.add(sp)
      }
      const shift = (p, dx, dz) => ({ x: p.x + dx, z: p.z + dz })
      // L 边:沿 ax 方向外推 az*off
      const lA = shift(p0, o.az.x * off, o.az.z * off)
      const lB = shift(p1, o.az.x * off, o.az.z * off)
      drawDim(lA, lB, `L ${m.L.toFixed(1)}m`)
      // W 边:沿 -ax*off 外推
      const wA = shift(p0, -o.ax.x * off, -o.ax.z * off)
      const wB = shift(p3, -o.ax.x * off, -o.ax.z * off)
      drawDim(wA, wB, `W ${m.W.toFixed(1)}m`)
    }

    // 相邻间距
    const gapMat = new THREE.LineDashedMaterial({ color: 0xef6c00, dashSize: 0.12, gapSize: 0.08, depthTest: false })
    for (const g of gapsBetween(obbs)) {
      // 沿净距方向画虚线
      const oa = makeOBB(list.find(i => i.id === g.a)), ob = makeOBB(list.find(i => i.id === g.b))
      let pA, pB
      if (g.kind === 'x') {
        const dir = ob.minX > oa.maxX ? 1 : -1
        pA = new THREE.Vector3(dir > 0 ? oa.maxX : oa.minX, y, g.z)
        pB = new THREE.Vector3(dir > 0 ? ob.minX : ob.maxX, y, g.z)
      } else {
        const dir = ob.minZ > oa.maxZ ? 1 : -1
        pA = new THREE.Vector3(g.x, y, dir > 0 ? oa.maxZ : oa.minZ)
        pB = new THREE.Vector3(g.x, y, dir > 0 ? ob.minZ : ob.maxZ)
      }
      const geo = new THREE.BufferGeometry().setFromPoints([pA, pB])
      const line = new THREE.Line(geo, gapMat)
      line.computeLineDistances()
      this.overlayGroup.add(line)
      const sp = makeTextSprite(`间距 ${g.gap.toFixed(2)}m`, { scale: 0.22, color: '#e65100' })
      sp.position.set((pA.x + pB.x) / 2, y + 0.01, (pA.z + pB.z) / 2)
      this.overlayGroup.add(sp)
    }
  }

  // ---------- 变换手柄(平移/旋转/缩放) ----------
  buildGizmo() {
    this.gizmo = new THREE.Group()
    const mkMat = c => new THREE.MeshBasicMaterial({ color: c, depthTest: false })
    const arrow = (dir, color) => {
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.3, 16), mkMat(color))
      if (dir === 'x') m.rotation.z = -Math.PI / 2
      if (dir === 'z') m.rotation.x = Math.PI / 2
      m.position[dir] = 0.45
      m.userData.handle = dir === 'y' ? 'moveY' : 'move'
      m.renderOrder = 900
      return m
    }
    const ax = arrow('x', 0xe53935), az = arrow('z', 0x2e7d32), ay = arrow('y', 0x1e88e5)
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.035, 10, 48), mkMat(0xffb300))
    ring.rotation.x = Math.PI / 2
    ring.userData.handle = 'rotate'
    ring.renderOrder = 900
    const cube = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), mkMat(0x8e24aa))
    cube.position.set(0.45, 0.45, 0.45)
    cube.userData.handle = 'scale'
    cube.renderOrder = 900
    // 平移拾取盘(大一点方便点)
    const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 24), mkMat(0xffcdd2))
    disk.position.y = 0.01
    disk.userData.handle = 'move'
    disk.renderOrder = 899
    this.gizmo.add(ax, az, ay, ring, cube, disk)
    this.gizmoMeshes = [ax, az, ay, ring, cube, disk]
    this.gizmo.visible = false
    this.scene.add(this.gizmo)
  }

  updateGizmo() {
    const sel = [...(this._selected || [])]
    if (!sel.length) { this.gizmo.visible = false; return }
    const list = this._list || []
    const picked = list.filter(i => sel.includes(i.id))
    if (!picked.length) { this.gizmo.visible = false; return }
    const cx = picked.reduce((s, i) => s + i.x, 0) / picked.length
    const cz = picked.reduce((s, i) => s + i.z, 0) / picked.length
    const cy = picked.reduce((s, i) => s + i.y, 0) / picked.length
    this.gizmo.position.set(cx, cy + 0.3, cz)
    this.gizmo.visible = true
  }

  // ---------- 拾取与指针手势 ----------
  bindPointer() {
    const el = this.renderer.domElement
    el.addEventListener('pointerdown', e => this.onPointerDown(e))
    window.addEventListener('pointermove', e => this.onPointerMove(e))
    window.addEventListener('pointerup', e => this.onPointerUp(e))
    this.raycaster = new THREE.Raycaster()
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  }

  ndc(e) {
    const r = this.renderer.domElement.getBoundingClientRect()
    return new THREE.Vector2(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1
    )
  }

  rayGround(e, y = 0) {
    this.raycaster.setFromCamera(this.ndc(e), this.camera)
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -y)
    const hit = new THREE.Vector3()
    return this.raycaster.ray.intersectPlane(plane, hit) ? hit : null
  }

  pickInst(e) {
    this.raycaster.setFromCamera(this.ndc(e), this.camera)
    const hits = this.raycaster.intersectObjects(this.pickMeshes, false)
    return hits.length ? hits[0].object.userData.instId : null
  }

  pickHandle(e) {
    if (!this.gizmo.visible) return null
    this.raycaster.setFromCamera(this.ndc(e), this.camera)
    const hits = this.raycaster.intersectObjects(this.gizmoMeshes, false)
    return hits.length ? hits[0].object.userData.handle : null
  }

  onPointerDown(e) {
    if (e.button !== 0) return
    const handle = this.pickHandle(e)
    const instId = handle ? null : this.pickInst(e)

    if (handle) {
      this.startHandleGesture(handle, e)
      return
    }
    if (instId) {
      const additive = e.shiftKey
      if (additive || !this._selected?.has(instId)) {
        if (additive) {
          selStore.update(s => { const n = new Set(s); n.has(instId) ? n.delete(instId) : n.add(instId); return n })
        } else {
          selStore.set(new Set([instId]))
        }
      }
      // 拖动器材本体 = 平移
      this.startMoveGesture(e, false)
      return
    }
    // 空白处:框选
    this.startMarquee(e)
  }

  startMarquee(e) {
    this.controls.enabled = false
    const r = this.renderer.domElement.getBoundingClientRect()
    const div = document.createElement('div')
    div.style.cssText = 'position:absolute;border:1.5px dashed #1565c0;background:rgba(21,101,192,0.08);pointer-events:none;z-index:50'
    this.container.appendChild(div)
    this.marquee = {
      x0: e.clientX, y0: e.clientY, div,
      rect: r, additive: e.shiftKey
    }
  }

  startMoveGesture(e, isHandle) {
    const sel = new Set(this._selected)
    if (!sel.size) return
    this.controls.enabled = false
    const list = this._list.filter(i => sel.has(i.id))
    // 统一在 y=0 地面求交取平面偏移，避免斜视角下不同高度平面造成的漂移
    this.gesture = {
      kind: 'move',
      start: this.rayGroundAt(e, 0) || new THREE.Vector3(),
      originals: list.map(i => ({ ...i }))
    }
  }

  startHandleGesture(handle, e) {
    this.controls.enabled = false
    const sel = new Set(this._selected)
    const list = this._list.filter(i => sel.has(i.id))
    const center = {
      x: list.reduce((s, i) => s + i.x, 0) / list.length,
      z: list.reduce((s, i) => s + i.z, 0) / list.length
    }
    if (handle === 'move' || handle === 'moveY') {
      this.gesture = {
        kind: handle === 'moveY' ? 'moveY' : 'move',
        start: this.rayGroundAt(e, handle === 'moveY' ? list[0].y : 0) || new THREE.Vector3(),
        originals: list.map(i => ({ ...i })),
        planeY: list[0].y
      }
    } else if (handle === 'rotate') {
      const p = this.rayGroundAt(e, 0)
      this.gesture = {
        kind: 'rotate', center,
        startAngle: p ? Math.atan2(p.z - center.z, p.x - center.x) : 0,
        applied: 0,
        originals: list.map(i => ({ ...i }))
      }
    } else if (handle === 'scale') {
      const p = this.rayGroundAt(e, 0)
      this.gesture = {
        kind: 'scale', center,
        startDist: p ? Math.hypot(p.x - center.x, p.z - center.z) : 1,
        step: 0,
        originals: list.map(i => ({ ...i }))
      }
    }
  }

  rayGroundAt(e, y = 0) {
    this.raycaster.setFromCamera(this.ndc(e), this.camera)
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -y)
    const hit = new THREE.Vector3()
    return this.raycaster.ray.intersectPlane(plane, hit) ? hit : null
  }

  onPointerMove(e) {
    if (this.marquee) this.updateMarquee(e)
    if (!this.gesture) {
      // 光标提示
      const h = this.pickHandle(e)
      this.renderer.domElement.style.cursor = h ? 'crosshair' : (this.pickInst(e) ? 'move' : '')
      return
    }
    const g = this.gesture
    if (g.kind === 'move') {
      const hit = this.rayGroundAt(e, 0)
      if (!hit) return
      const dx = snap(hit.x - g.start.x)
      const dz = snap(hit.z - g.start.z)
      this.applyGesture(g.originals.map(o => ({
        id: o.id, x: snap(o.x + dx), z: snap(o.z + dz)
      })))
    } else if (g.kind === 'moveY') {
      const hit = this.rayGroundAt(e, g.planeY)
      if (!hit) return
      const dy = snap(hit.y - g.start.y)
      this.applyGesture(g.originals.map(o => ({ id: o.id, y: snap(o.y + dy) })))
    } else if (g.kind === 'rotate') {
      const hit = this.rayGroundAt(e, 0)
      if (!hit) return
      const ang = Math.atan2(hit.z - g.center.z, hit.x - g.center.x)
      let delta = ang - g.startAngle
      const snappedSteps = Math.round(delta / ROT_STEP)
      const target = snappedSteps * ROT_STEP
      if (target === g.applied) return
      const d = target - g.applied
      g.applied = target
      const c = Math.cos(d), s = Math.sin(d)
      this.applyGesture(g.originals.map(o => {
        const ox = o.x - g.center.x, oz = o.z - g.center.z
        return {
          id: o.id,
          x: snap(g.center.x + ox * c - oz * s),
          z: snap(g.center.z + ox * s + oz * c),
          rotY: o.rotY + d
        }
      }))
    } else if (g.kind === 'scale') {
      const hit = this.rayGround(e)
      if (!hit) return
      const dist = Math.hypot(hit.x - g.center.x, hit.z - g.center.z)
      // 每 0.5m 拖动距离 = 缩放变化 0.1 档
      const steps = Math.round((dist - g.startDist) / 0.5)
      if (steps === g.step) return
      g.step = steps
      const factor = Math.max(0.3, 1 + steps * 0.1)
      this.applyGesture(g.originals.map(o => ({
        id: o.id,
        x: snap(g.center.x + (o.x - g.center.x) * factor),
        z: snap(g.center.z + (o.z - g.center.z) * factor),
        scale: Math.max(0.3, Math.round(o.scale * factor * 10) / 10)
      })))
    }
  }

  // 整组同时落位:任一器材冲突/越界则整体拒绝(恢复手势起点快照)
  applyGesture(candidates) {
    const byId = new Map(candidates.map(c => [c.id, c]))
    const trialList = this._list.map(i => byId.has(i.id) ? { ...i, ...byId.get(i.id) } : i)
    let allValid = true
    for (const c of candidates) {
      const inst = trialList.find(i => i.id === c.id)
      const { valid } = checkPlacement(inst, trialList.filter(i => i.id !== c.id), this.currentRoom())
      if (!valid) { allValid = false; break }
    }
    if (!allValid) {
      // 拒绝落位:恢复手势开始时的原始数据
      if (!this._rejecting) {
        this._rejecting = true
        flashReject('落位被拒绝：包围盒相交或越界，已恢复上一合法位置')
      }
      instStore.update(list => list.map(i => {
        const o = this.gesture.originals.find(x => x.id === i.id)
        return o ? { ...o } : i
      }))
      return
    }
    this._rejecting = false
    instStore.update(list => list.map(i => {
      const c = byId.get(i.id)
      if (!c) return i
      const trial = { ...i, ...c }
      // 自动吸附贴合高度
      const others = trialList.filter(t => t.id !== i.id).map(makeOBB)
      const snapY = nearestLocal(trial, others)
      if (snapY !== null) trial.y = snapY
      return trial
    }))
  }

  onPointerUp(e) {
    if (this.marquee) this.finishMarquee(e)
    if (this.gesture) {
      this.gesture = null
      this._rejecting = false
      this.controls = this._viewMode === 'top' ? this.topCtrl : this.perspCtrl
      this.controls.enabled = true
    }
  }

  updateMarquee(e) {
    const m = this.marquee
    const x = Math.min(e.clientX, m.x0), y = Math.min(e.clientY, m.y0)
    const w = Math.abs(e.clientX - m.x0), h = Math.abs(e.clientY - m.y0)
    m.div.style.left = `${x - m.rect.left}px`
    m.div.style.top = `${y - m.rect.top}px`
    m.div.style.width = `${w}px`
    m.div.style.height = `${h}px`
  }

  finishMarquee(e) {
    const m = this.marquee
    m.div.remove()
    const r = m.rect
    const x1 = Math.min(m.x0, e.clientX), x2 = Math.max(m.x0, e.clientX)
    const y1 = Math.min(m.y0, e.clientY), y2 = Math.max(m.y0, e.clientY)
    const ids = []
    const v = new THREE.Vector3()
    for (const [id, g] of this.groups) {
      v.set(g.position.x, g.position.y + 0.2, g.position.z).project(this.camera)
      const sx = (v.x * 0.5 + 0.5) * r.width + r.left
      const sy = (-v.y * 0.5 + 0.5) * r.height + r.top
      if (sx >= x1 && sx <= x2 && sy >= y1 && sy <= y2) ids.push(id)
    }
    if (ids.length || !m.additive) {
      selStore.update(s => {
        const n = m.additive ? new Set(s) : new Set()
        for (const id of ids) n.add(id)
        return n
      })
    }
    this.marquee = null
    this.controls.enabled = true
  }

  // ---------- 视图切换 ----------
  setViewMode(mode) {
    this._viewMode = mode
    if (mode === 'top') {
      this.camera = this.topCam
      this.perspCtrl.enabled = false
      this.topCtrl.enabled = true
      this.controls = this.topCtrl
      this.fitTop()
    } else {
      this.camera = this.perspCam
      this.topCtrl.enabled = false
      this.perspCtrl.enabled = true
      this.controls = this.perspCtrl
    }
    this.rebuildOverlay(this._list)
  }

  // ---------- 俯视 PNG 导出 ----------
  exportTopPNG() {
    const rm = this.currentRoom()
    const oldSize = new THREE.Vector2()
    this.renderer.getSize(oldSize)
    const Wpx = 2048
    const Hpx = Math.round(Wpx * rm.W / rm.L)
    const prevCam = this.camera
    const gizmoVis = this.gizmo.visible
    this.gizmo.visible = false
    const exportCam = this.topCam.clone()
    const aspect = Wpx / Hpx
    const margin = 1.12
    let halfW = rm.L * margin / 2, halfH = halfW / aspect
    if (halfH * 2 < rm.W * margin) { halfH = rm.W * margin / 2; halfW = halfH * aspect }
    exportCam.left = -halfW; exportCam.right = halfW
    exportCam.top = halfH; exportCam.bottom = -halfH
    exportCam.updateProjectionMatrix()
    this.renderer.setSize(Wpx, Hpx, false)
    this.renderer.render(this.scene, exportCam)
    const url = this.renderer.domElement.toDataURL('image/png')
    this.renderer.setSize(oldSize.x, oldSize.y, false)
    this.camera = prevCam
    this.gizmo.visible = gizmoVis
    this.fitTop()
    return url
  }

  // ---------- store 绑定 ----------
  bindStores() {
    this.unsubs.push(instStore.subscribe(list => {
      this._list = list
      this.syncInstances(list)
    }))
    this.unsubs.push(selStore.subscribe(s => {
      this._selected = s
      this.updateHighlight()
      this.updateGizmo()
    }))
    this.unsubs.push(roomStore.subscribe(rm => {
      this._room = rm
      this.buildRoom(rm)
      this.rebuildOverlay(this._list || [])
    }))
    this.unsubs.push(viewStore.subscribe(mode => {
      this._viewMode = mode
      this.setViewMode(mode)
    }))
    this.unsubs.push(dimStore.subscribe(v => {
      this._showDim = v
      this.rebuildOverlay(this._list || [])
    }))
  }

  // 器材库拖入:按落点 NDC 与地面求交,吸附到 0.1m 网格
  handleLibraryDrop(e) {
    const { type, ndc } = e.detail
    this.raycaster.setFromCamera(new THREE.Vector2(ndc.x, ndc.y), this.camera)
    const hit = new THREE.Vector3()
    if (!this.raycaster.ray.intersectPlane(this.groundPlane, hit)) return
    const rm = this.currentRoom()
    const x = clampSnap(hit.x, rm.L)
    const z = clampSnap(hit.z, rm.W)
    const created = instStore.add(type, x, z)
    instStore.patch(created.id, { x, z })
    selStore.set(new Set([created.id]))
  }

  animate() {
    this.raf = requestAnimationFrame(this.animate)
    this.controls?.update()
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('psle-drop', this._onDrop)
    this.unsubs.forEach(u => u())
    this.perspCtrl.dispose(); this.topCtrl.dispose()
    disposeGroup(this.roomGroup); disposeGroup(this.equipGroup); disposeGroup(this.overlayGroup)
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}

function snap(v) {
  return Math.round(v / POS_STEP) * POS_STEP
}

function clampSnap(v, max) {
  const s = snap(v)
  return Math.min(Math.max(s, 0), Math.floor(max / POS_STEP) * POS_STEP)
}

// 本地版吸附(避免与 stores 循环依赖)
function nearestLocal(inst, obbs) {
  const target = makeOBB(inst)
  let best = { y: 0, dy: Math.abs(inst.y) }
  for (const o of obbs) {
    if (o.inst.id === inst.id) continue
    if (!obbIntersect2D(target, o)) continue
    const dy = Math.abs(inst.y - o.top)
    if (dy < best.dy) best = { y: o.top, dy }
  }
  return best.dy <= 0.2 ? snap(best.y) : null
}

function disposeGroup(group) {
  group.traverse(o => {
    if (o.geometry) o.geometry.dispose?.()
    if (o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material]
      for (const m of mats) {
        if (m.map) m.map.dispose?.()
        m.dispose?.()
      }
    }
    if (o.userData?.dispose) o.userData.dispose()
  })
  group.clear()
}
