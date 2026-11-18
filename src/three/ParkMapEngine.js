import * as THREE from 'three'
import { DEVICE_TYPES, DEVICE_STATUS, DEVICE_TYPE_LIST } from '../core/constants'

const STATUS_HEX = Object.fromEntries(
  Object.entries(DEVICE_STATUS).map(([k, v]) => [k, new THREE.Color(v.color)])
)
const TYPE_HEX = Object.fromEntries(
  Object.entries(DEVICE_TYPES).map(([k, v]) => [k, new THREE.Color(v.color)])
)

// 线段交点，返回 t/u 参数与坐标
function segIntersect(a, b, c, d) {
  const rx = b.x - a.x,
    ry = b.y - a.y
  const sx = d.x - c.x,
    sy = d.y - c.y
  const denom = rx * sy - ry * sx
  if (Math.abs(denom) < 1e-9) return null
  const qpx = c.x - a.x,
    qpy = c.y - a.y
  const t = (qpx * sy - qpy * sx) / denom
  const u = (qpx * ry - qpy * rx) / denom
  if (t <= 0.02 || t >= 0.98 || u <= 0 || u >= 1) return null
  return { t, x: a.x + rx * t, y: a.y + ry * t }
}

// 各设备类型的俯视图标形状
function makeShape(type) {
  const s = new THREE.Shape()
  switch (type) {
    case 'lifeguard': {
      // 高椅：三角形
      s.moveTo(0, 8)
      s.lineTo(-7, -6)
      s.lineTo(7, -6)
      s.closePath()
      break
    }
    case 'lamp': {
      // 灯杆：圆
      s.absarc(0, 0, 6, 0, Math.PI * 2, false)
      break
    }
    case 'sprinkler': {
      // 喷淋头：菱形
      s.moveTo(0, 7)
      s.lineTo(6, 0)
      s.lineTo(0, -7)
      s.lineTo(-6, 0)
      s.closePath()
      break
    }
    case 'drain': {
      // 排水篦子：方框
      s.moveTo(-6, -6)
      s.lineTo(6, -6)
      s.lineTo(6, 6)
      s.lineTo(-6, 6)
      s.closePath()
      break
    }
    case 'camera': {
      // 监控：五边形
      s.moveTo(0, 7)
      s.lineTo(7, 2)
      s.lineTo(4.5, -6.5)
      s.lineTo(-4.5, -6.5)
      s.lineTo(-7, 2)
      s.closePath()
      break
    }
  }
  return new THREE.ShapeGeometry(s)
}

export class ParkMapEngine {
  constructor(container, store) {
    this.container = container
    this.store = store
    const { bounds } = store.getState().parkData
    this.bounds = bounds

    this.width = container.clientWidth
    this.height = container.clientHeight

    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    this.renderer.setPixelRatio(1) // 导出时与覆盖层像素一一对应
    this.renderer.setSize(this.width, this.height)
    this.renderer.setClearColor(0x0b1220, 1)
    container.appendChild(this.renderer.domElement)
    this.canvas = this.renderer.domElement
    this.canvas.style.display = 'block'
    this.canvas.style.touchAction = 'none'

    // 覆盖层：编号 / 角度标注 / 框选矩形
    this.overlay = document.createElement('canvas')
    this.overlay.width = this.width
    this.overlay.height = this.height
    this.overlay.style.position = 'absolute'
    this.overlay.style.inset = '0'
    this.overlay.style.pointerEvents = 'none'
    container.appendChild(this.overlay)
    this.ctx = this.overlay.getContext('2d')

    this.scene = new THREE.Scene()
    this.viewH = (bounds.maxY - bounds.minY) * 1.12
    this.minViewH = 70
    this.maxViewH = (bounds.maxY - bounds.minY) * 1.3
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 5000)
    this.camera.position.set(
      (bounds.minX + bounds.maxX) / 2,
      (bounds.minY + bounds.maxY) / 2,
      1000
    )
    this.camera.lookAt(this.camera.position.x, this.camera.position.y, 0)
    this.updateFrustum()

    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()

    this.groups = {
      pools: new THREE.Group(),
      pipes: new THREE.Group(),
      green: new THREE.Group(),
      warning: new THREE.Group(),
      points: new THREE.Group(),
      icons: new THREE.Group(),
      rings: new THREE.Group(),
    }
    Object.values(this.groups).forEach((g) => this.scene.add(g))

    this.instanced = {} // type -> { mesh, ids: [] }
    this.pointClouds = {}
    this.labelItems = []
    this.nameLabels = []
    this.angleItems = []
    this.ringMesh = null
    this.boxRect = null
    this.selectMode = false
    this.fly = null

    this.buildPools()
    this.buildPipes()
    this.buildGreen()
    this.buildWarnings()
    this.buildDeviceLayer()
    this.bindEvents()

    this.unsub = store.subscribe((s, prev) => {
      if (
        s.view !== prev.view ||
        s.layers !== prev.layers ||
        s.deviceTypeVisible !== prev.deviceTypeVisible ||
        s.statusOverrides !== prev.statusOverrides
      ) {
        this.applyScope()
      }
      if (s.selectedIds !== prev.selectedIds) {
        this.buildRings(s.selectedIds)
        this.refreshLabels()
      }
    })
    this.applyScope()

    this.raf = requestAnimationFrame(this.loop)
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(container)
  }

  // ---------- 静态底图构件 ----------
  buildPools() {
    const { pools } = this.store.getState().parkData
    this.poolMeshes = []
    pools.forEach((p) => {
      const shape = new THREE.Shape()
      p.polygon.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)))
      shape.closePath()
      const fill = new THREE.Mesh(
        new THREE.ShapeGeometry(shape),
        new THREE.MeshBasicMaterial({ color: 0x1d4ed8, transparent: true, opacity: 0.22 })
      )
      const pts = p.polygon.map(([x, y]) => new THREE.Vector3(x, y, 0.1))
      pts.push(new THREE.Vector3(p.polygon[0][0], p.polygon[0][1], 0.1))
      const outline = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0x60a5fa })
      )
      this.groups.pools.add(fill, outline)
      this.poolMeshes.push({ pool: p, fill, outline })
    })
  }

  // 管线：按管径定粗细与分色；与高高程管交叉处，低高程管自动断开
  buildPipes() {
    const { pipes } = this.store.getState().parkData
    const segs = []
    pipes.forEach((p) => {
      for (let i = 0; i < p.points.length - 1; i++) {
        segs.push({
          pipe: p,
          a: { x: p.points[i][0], y: p.points[i][1] },
          b: { x: p.points[i + 1][0], y: p.points[i + 1][1] },
        })
      }
    })
    // 收集每根线段上“被高位管跨过”的断开参数
    segs.forEach((s) => {
      s.breaks = []
      segs.forEach((o) => {
        if (o === s || o.pipe.z <= s.pipe.z) return
        const hit = segIntersect(s.a, s.b, o.a, o.b)
        if (hit) s.breaks.push(hit.t)
      })
      s.breaks.sort((a, b) => a - b)
    })

    const GAP = 11
    const pieces = []
    segs.forEach((s) => {
      const len = Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y)
      const ang = Math.atan2(s.b.y - s.a.y, s.b.x - s.a.x)
      let cursor = 0
      const emit = (t0, t1) => {
        if (t1 - t0 < 0.02) return
        pieces.push({
          cx: s.a.x + ((s.b.x - s.a.x) * (t0 + t1)) / 2,
          cy: s.a.y + ((s.b.y - s.a.y) * (t0 + t1)) / 2,
          len: len * (t1 - t0),
          ang,
          color: s.pipe.color,
          diameter: s.pipe.diameter,
        })
      }
      s.breaks.forEach((t) => {
        const g0 = t - GAP / len
        const g1 = t + GAP / len
        emit(cursor, Math.max(cursor, g0))
        cursor = Math.max(cursor, g1)
      })
      emit(cursor, 1)
    })

    const geo = new THREE.BoxGeometry(1, 1, 1)
    const mat = new THREE.MeshBasicMaterial()
    const mesh = new THREE.InstancedMesh(geo, mat, pieces.length)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    pieces.forEach((pc, i) => {
      e.set(0, 0, pc.ang)
      q.setFromEuler(e)
      const thickness = 2 + pc.diameter / 22
      m.compose(
        new THREE.Vector3(pc.cx, pc.cy, 0.2),
        q,
        new THREE.Vector3(pc.len, thickness, 1)
      )
      mesh.setMatrixAt(i, m)
      mesh.setColorAt(i, new THREE.Color(pc.color))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    this.groups.pipes.add(mesh)
  }

  buildGreen() {
    const { greens } = this.store.getState().parkData
    greens.forEach((g) => {
      const grp = new THREE.Group()
      g.lawns.forEach((poly) => {
        const shape = new THREE.Shape()
        poly.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)))
        shape.closePath()
        grp.add(
          new THREE.Mesh(
            new THREE.ShapeGeometry(shape),
            new THREE.MeshBasicMaterial({ color: 0x15803d, transparent: true, opacity: 0.5 })
          )
        )
      })
      const treeGeo = new THREE.CircleGeometry(1, 10)
      const treeMesh = new THREE.InstancedMesh(
        treeGeo,
        new THREE.MeshBasicMaterial({ color: 0x4ade80 }),
        g.trees.length
      )
      const m = new THREE.Matrix4()
      g.trees.forEach((t, i) => {
        m.makeScale(t.r, t.r, 1)
        m.setPosition(t.x, t.y, 0.05)
        treeMesh.setMatrixAt(i, m)
      })
      grp.add(treeMesh)
      grp.visible = false
      grp.userData.districtId = g.districtId
      this.groups.green.add(grp)
    })
  }

  buildWarnings() {
    const { warnings } = this.store.getState().parkData
    warnings.forEach((w) => {
      const pts = w.points.map(([x, y]) => new THREE.Vector3(x, y, 0.3))
      pts.push(new THREE.Vector3(w.points[0][0], w.points[0][1], 0.3))
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineDashedMaterial({ color: 0xf97316, dashSize: 10, gapSize: 6 })
      )
      line.computeLineDistances()
      line.visible = false
      line.userData.poolId = w.poolId
      this.groups.warning.add(line)
    })
  }

  // ---------- 设备层（全园点阵 / 片区以上实例化图标） ----------
  buildDeviceLayer() {
    const { devices } = this.store.getState().parkData
    this.devicesByType = Object.fromEntries(DEVICE_TYPE_LIST.map((t) => [t.key, []]))
    devices.forEach((d) => this.devicesByType[d.type].push(d))

    DEVICE_TYPE_LIST.forEach((t) => {
      // 图标实例
      const geo = makeShape(t.key)
      const mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial(), 20000)
      mesh.count = 0
      mesh.userData.type = t.key
      mesh.raycast = THREE.InstancedMesh.prototype.raycast
      this.groups.icons.add(mesh)
      this.instanced[t.key] = { mesh, ids: [] }

      // 全园点阵
      const list = this.devicesByType[t.key]
      const pgeo = new THREE.BufferGeometry()
      pgeo.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(list.flatMap((d) => [d.x, d.y, 0.4]), 3)
      )
      const pcolor = new Float32Array(list.length * 3)
      const points = new THREE.Points(
        pgeo,
        new THREE.PointsMaterial({ size: 6, sizeAttenuation: false, vertexColors: true })
      )
      points.userData.type = t.key
      this.groups.points.add(points)
      this.pointClouds[t.key] = { points, list, colors: pcolor }
    })

    // 高亮描边环
    const ringGeo = new THREE.RingGeometry(10, 13, 28)
    this.ringMesh = new THREE.InstancedMesh(
      ringGeo,
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide }),
      20000
    )
    this.ringMesh.count = 0
    this.groups.rings.add(this.ringMesh)
  }

  statusOf = (d) => this.store.getState().deviceStatus(d.id)

  scopedDevices() {
    const { view } = this.store.getState()
    const all = this.store.getState().parkData.devices
    if (view.level === 'park') return all
    if (view.level === 'district') return all.filter((d) => d.districtId === view.districtId)
    return all.filter((d) => d.poolId === view.poolId)
  }

  applyScope() {
    const state = this.store.getState()
    const { view, layers, deviceTypeVisible } = state

    // 池体：全园只留轮廓
    this.poolMeshes.forEach(({ pool, fill, outline }) => {
      if (view.level === 'park') {
        fill.visible = false
        outline.visible = true
      } else if (view.level === 'district') {
        const hit = pool.districtId === view.districtId
        fill.visible = hit
        outline.visible = hit
      } else {
        const hit = pool.id === view.poolId
        fill.visible = hit
        outline.visible = hit
      }
    })

    // 管线 / 绿化 / 警戒线：全园隐藏，片区与池体按所属片区显示
    const detailOn = view.level !== 'park'
    this.groups.pipes.visible = detailOn && layers.pipeline
    this.groups.green.visible = detailOn && layers.green
    this.groups.green.children.forEach((g) => {
      g.visible = detailOn && layers.green && g.userData.districtId === view.districtId
    })
    this.groups.warning.visible = detailOn && layers.warning
    this.groups.warning.children.forEach((l) => {
      const pool = state.getPool(l.userData.poolId)
      l.visible = detailOn && layers.warning && pool.districtId === view.districtId
    })

    // 设备层
    const showDevice = layers.device
    this.groups.points.visible = showDevice && view.level === 'park'
    this.groups.icons.visible = showDevice && view.level !== 'park'
    if (view.level === 'park') {
      DEVICE_TYPE_LIST.forEach((t) => {
        const { points, list, colors } = this.pointClouds[t.key]
        points.visible = showDevice && deviceTypeVisible[t.key]
        list.forEach((d, i) => {
          const c = STATUS_HEX[this.statusOf(d)]
          colors[i * 3] = c.r
          colors[i * 3 + 1] = c.g
          colors[i * 3 + 2] = c.b
        })
        points.geometry.getAttribute('position').needsUpdate = true
        points.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      })
    } else {
      this.rebuildIcons()
    }
    this.refreshLabels()
    this.buildRings(state.selectedIds)
  }

  rebuildIcons() {
    const { deviceTypeVisible, layers } = this.store.getState()
    const scoped = this.scopedDevices()
    const m = new THREE.Matrix4()
    DEVICE_TYPE_LIST.forEach((t) => {
      const entry = this.instanced[t.key]
      const list = scoped.filter(
        (d) => d.type === t.key && layers.device && deviceTypeVisible[t.key]
      )
      entry.ids = list.map((d) => d.id)
      entry.mesh.count = list.length
      list.forEach((d, i) => {
        m.makeScale(t.size / 12, t.size / 12, 1)
        m.setPosition(d.x, d.y, 0.6)
        entry.mesh.setMatrixAt(i, m)
        const status = this.statusOf(d)
        entry.mesh.setColorAt(i, status === 'normal' ? TYPE_HEX[t.key] : STATUS_HEX[status])
      })
      entry.mesh.instanceMatrix.needsUpdate = true
      if (entry.mesh.instanceColor) entry.mesh.instanceColor.needsUpdate = true
      entry.mesh.visible = list.length > 0
    })
  }

  buildRings(ids) {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const get = this.store.getState().getDevice
    this.ringMesh.count = ids.length
    ids.forEach((id, i) => {
      const d = get(id)
      if (!d) return
      const t = DEVICE_TYPES[d.type]
      m.compose(
        new THREE.Vector3(d.x, d.y, 0.8),
        q,
        new THREE.Vector3(t.size / 9, t.size / 9, 1)
      )
      this.ringMesh.setMatrixAt(i, m)
    })
    if (ids.length === 0) {
      m.makeScale(0, 0, 0)
      this.ringMesh.setMatrixAt(0, m)
    }
    this.ringMesh.instanceMatrix.needsUpdate = true
  }

  // ---------- 标注（网格抽稀，选中强制保留） ----------
  refreshLabels() {
    const state = this.store.getState()
    const { view, layers, deviceTypeVisible, selectedIds } = state
    this.nameLabels = []
    this.labelItems = []
    this.angleItems = []
    if (!layers.device) return

    if (view.level === 'park') {
      state.parkData.districts.forEach((d) => {
        const cx = (d.bbox.minX + d.bbox.maxX) / 2
        const cy = (d.bbox.minY + d.bbox.maxY) / 2
        this.nameLabels.push({ x: cx, y: cy, text: d.name, big: true })
      })
      return
    }

    // 池名
    state.parkData.pools
      .filter((p) => (view.level === 'district' ? p.districtId === view.districtId : p.id === view.poolId))
      .forEach((p) => this.nameLabels.push({ x: p.center.x, y: p.center.y, text: p.name, big: false }))

    const scoped = this.scopedDevices().filter((d) => deviceTypeVisible[d.type])
    const cell = view.level === 'pool' ? 58 : 74
    const grid = new Map()
    const sel = new Set(selectedIds)
    scoped.forEach((d) => {
      const sp = this.worldToScreen(d.x, d.y)
      if (!sp) return
      const gx = Math.floor(sp.x / cell)
      const gy = Math.floor(sp.y / cell)
      const key = `${gx},${gy}`
      const forced = sel.has(d.id)
      if (!forced && grid.has(key)) return
      grid.set(key, d.id)
      this.labelItems.push({
        id: d.id,
        x: d.x,
        y: d.y,
        text: d.code,
        status: this.statusOf(d),
        forced,
      })
    })

    // 池体级别：喷淋头朝向箭头 + 角度标注
    if (view.level === 'pool') {
      scoped
        .filter((d) => d.type === 'sprinkler')
        .forEach((d) => {
          const deg = ((d.angle * 180) / Math.PI + 360) % 360
          this.angleItems.push({ x: d.x, y: d.y, angle: d.angle, text: `${Math.round(deg)}°` })
        })
    }
  }

  drawOverlay() {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.width, this.height)
    const sel = new Set(this.store.getState().selectedIds)

    // 名称标注
    this.nameLabels.forEach((n) => {
      const sp = this.worldToScreen(n.x, n.y)
      if (!sp) return
      ctx.font = n.big ? 'bold 20px "Microsoft YaHei", sans-serif' : 'bold 15px "Microsoft YaHei", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.lineWidth = 4
      ctx.strokeStyle = 'rgba(8,15,28,0.85)'
      ctx.fillStyle = n.big ? '#e2e8f0' : '#93c5fd'
      ctx.strokeText(n.text, sp.x, sp.y)
      ctx.fillText(n.text, sp.x, sp.y)
    })

    // 构件编号
    ctx.font = '11px Consolas, monospace'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    this.labelItems.forEach((it) => {
      const sp = this.worldToScreen(it.x, it.y)
      if (!sp) return
      const ox = 9,
        oy = -9
      const text = it.text
      const w = ctx.measureText(text).width
      ctx.fillStyle = sel.has(it.id)
        ? 'rgba(34,211,238,0.92)'
        : 'rgba(8,15,28,0.72)'
      ctx.fillRect(sp.x + ox - 3, sp.y + oy - 8, w + 6, 15)
      ctx.fillStyle = DEVICE_STATUS[it.status].color
      ctx.beginPath()
      ctx.arc(sp.x + ox - 0.5, sp.y + oy, 2.6, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#e2e8f0'
      ctx.fillText(text, sp.x + ox + 5, sp.y + oy)
    })

    // 喷淋朝向与角度（仅池体级）
    if (this.angleItems.length) {
      const pxLen = 17
      const wpp = this.viewH / this.height
      ctx.lineWidth = 1.6
      this.angleItems.forEach((a) => {
        const sp = this.worldToScreen(a.x, a.y)
        if (!sp) return
        const tip = this.worldToScreen(
          a.x + Math.cos(a.angle) * pxLen * wpp,
          a.y + Math.sin(a.angle) * pxLen * wpp
        )
        ctx.strokeStyle = '#5eead4'
        ctx.fillStyle = '#5eead4'
        ctx.beginPath()
        ctx.moveTo(sp.x, sp.y)
        ctx.lineTo(tip.x, tip.y)
        ctx.stroke()
        // 箭头
        const ah = Math.atan2(tip.y - sp.y, tip.x - sp.x)
        ctx.beginPath()
        ctx.moveTo(tip.x, tip.y)
        ctx.lineTo(tip.x - 7 * Math.cos(ah - 0.45), tip.y - 7 * Math.sin(ah - 0.45))
        ctx.lineTo(tip.x - 7 * Math.cos(ah + 0.45), tip.y - 7 * Math.sin(ah + 0.45))
        ctx.closePath()
        ctx.fill()
        ctx.font = '10px Consolas, monospace'
        ctx.textAlign = 'left'
        ctx.fillText(a.text, tip.x + 4, tip.y - 4)
      })
    }

    // 框选矩形
    if (this.boxRect) {
      const { x0, y0, x1, y1 } = this.boxRect
      ctx.fillStyle = 'rgba(34,211,238,0.12)'
      ctx.strokeStyle = '#22d3ee'
      ctx.lineWidth = 1
      ctx.fillRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0))
      ctx.strokeRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0))
    }
  }

  // ---------- 坐标换算 ----------
  updateFrustum() {
    const aspect = this.width / this.height
    this.camera.top = this.viewH / 2
    this.camera.bottom = -this.viewH / 2
    this.camera.left = (-this.viewH * aspect) / 2
    this.camera.right = (this.viewH * aspect) / 2
    this.camera.updateProjectionMatrix()
  }

  worldToScreen(x, y) {
    const v = new THREE.Vector3(x, y, 0).project(this.camera)
    if (v.z < -1 || v.z > 1) return null
    return { x: (v.x * 0.5 + 0.5) * this.width, y: (-v.y * 0.5 + 0.5) * this.height }
  }

  screenToWorld(x, y) {
    const v = new THREE.Vector3((x / this.width) * 2 - 1, -(y / this.height) * 2 + 1, 0.5)
    v.unproject(this.camera)
    return { x: v.x, y: v.y }
  }

  // ---------- 交互 ----------
  bindEvents() {
    const el = this.renderer.domElement
    this._down = null
    el.addEventListener('contextmenu', (e) => e.preventDefault())
    el.addEventListener('pointerdown', this.onPointerDown)
    el.addEventListener('pointermove', this.onPointerMove)
    el.addEventListener('pointerup', this.onPointerUp)
    el.addEventListener('wheel', this.onWheel, { passive: false })
  }

  onPointerDown = (e) => {
    this.canvas.setPointerCapture(e.pointerId)
    this._down = {
      x: e.offsetX,
      y: e.offsetY,
      button: e.button,
      shift: e.shiftKey,
      moved: false,
    }
    if (this._down.shift || this.selectMode) {
      this.boxRect = { x0: e.offsetX, y0: e.offsetY, x1: e.offsetX, y1: e.offsetY }
    }
  }

  onPointerMove = (e) => {
    if (!this._down) {
      this.canvas.style.cursor = this.pickAt(e.offsetX, e.offsetY) ? 'pointer' : 'grab'
      return
    }
    const dx = e.offsetX - this._down.x
    const dy = e.offsetY - this._down.y
    if (Math.abs(dx) + Math.abs(dy) > 4) this._down.moved = true
    if (this.boxRect) {
      this.boxRect.x1 = e.offsetX
      this.boxRect.y1 = e.offsetY
      return
    }
    if (this._down.button === 0 && !this.selectMode && !this._down.shift) {
      const wpp = this.viewH / this.height
      this.camera.position.x -= dx * wpp
      this.camera.position.y += dy * wpp
      this._down.x = e.offsetX
      this._down.y = e.offsetY
    } else if (this._down.button === 2 || this._down.button === 1) {
      const wpp = this.viewH / this.height
      this.camera.position.x -= dx * wpp
      this.camera.position.y += dy * wpp
      this._down.x = e.offsetX
      this._down.y = e.offsetY
    }
  }

  onPointerUp = (e) => {
    const down = this._down
    this._down = null
    if (this.boxRect) {
      const ids = this.devicesInBox(this.boxRect)
      this.boxRect = null
      if (ids.length) this.onBoxSelect?.(ids)
      return
    }
    if (down && !down.moved && down.button === 0) {
      const hit = this.pickAt(e.offsetX, e.offsetY)
      this.onPick?.(hit ? hit.id : null)
    }
  }

  onWheel = (e) => {
    e.preventDefault()
    const before = this.screenToWorld(e.offsetX, e.offsetY)
    const factor = Math.exp(e.deltaY * 0.0012)
    this.viewH = THREE.MathUtils.clamp(this.viewH * factor, this.minViewH, this.maxViewH)
    this.updateFrustum()
    const after = this.screenToWorld(e.offsetX, e.offsetY)
    this.camera.position.x += before.x - after.x
    this.camera.position.y += before.y - after.y
    this.refreshLabels()
  }

  pickAt(sx, sy) {
    if (this.store.getState().view.level === 'park') return null
    this.pointer.set((sx / this.width) * 2 - 1, -(sy / this.height) * 2 + 1)
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const meshes = DEVICE_TYPE_LIST.map((t) => this.instanced[t.key].mesh).filter(
      (m) => m.visible && m.count > 0
    )
    const hits = this.raycaster.intersectObjects(meshes, false)
    if (!hits.length) return null
    const h = hits[0]
    const entry = Object.values(this.instanced).find((en) => en.mesh === h.object)
    const id = entry.ids[h.instanceId]
    return this.store.getState().getDevice(id)
  }

  devicesInBox(rect) {
    const { deviceTypeVisible, layers } = this.store.getState()
    if (!layers.device) return []
    const x0 = Math.min(rect.x0, rect.x1),
      x1 = Math.max(rect.x0, rect.x1)
    const y0 = Math.min(rect.y0, rect.y1),
      y1 = Math.max(rect.y0, rect.y1)
    return this.scopedDevices()
      .filter((d) => {
        if (!deviceTypeVisible[d.type]) return false
        const sp = this.worldToScreen(d.x, d.y)
        return sp && sp.x >= x0 && sp.x <= x1 && sp.y >= y0 && sp.y <= y1
      })
      .map((d) => d.id)
  }

  setSelectMode(on) {
    this.selectMode = on
    this.canvas.style.cursor = on ? 'crosshair' : 'grab'
  }

  // 屏幕坐标框选（外部/自动化可直接调用）
  boxSelectAtScreen(rect) {
    const ids = this.devicesInBox(rect)
    if (ids.length) this.onBoxSelect?.(ids)
    return ids
  }

  // ---------- 飞行定位 ----------
  flyToBbox(bbox, pad = 1.25) {
    if (!bbox) return
    const aspect = this.width / this.height
    const w = bbox.maxX - bbox.minX
    const h = bbox.maxY - bbox.minY
    const targetH = THREE.MathUtils.clamp(
      Math.max(h * pad, (w * pad) / aspect),
      this.minViewH,
      this.maxViewH
    )
    this.fly = {
      t0: performance.now(),
      dur: 650,
      fromH: this.viewH,
      toH: targetH,
      fromX: this.camera.position.x,
      fromY: this.camera.position.y,
      toX: (bbox.minX + bbox.maxX) / 2,
      toY: (bbox.minY + bbox.maxY) / 2,
    }
  }

  flyToDistrict(id) {
    const d = this.store.getState().parkData.districts.find((x) => x.id === id)
    if (d) this.flyToBbox(d.bbox)
  }

  flyToPool(id) {
    const p = this.store.getState().getPool(id)
    const xs = p.polygon.map((pt) => pt[0])
    const ys = p.polygon.map((pt) => pt[1])
    this.flyToBbox({ minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) })
  }

  flyToDevice(id) {
    const d = this.store.getState().getDevice(id)
    if (!d) return
    const half = Math.max(this.viewH * 0.12, 90)
    this.flyToBbox(
      { minX: d.x - half, maxX: d.x + half, minY: d.y - half, maxY: d.y + half },
      1
    )
  }

  ease(k) {
    return 1 - Math.pow(1 - k, 3)
  }

  // ---------- 导出当前视口平面图 ----------
  exportPNG() {
    this.renderer.render(this.scene, this.camera)
    const out = document.createElement('canvas')
    out.width = this.width
    out.height = this.height
    const c = out.getContext('2d')
    c.fillStyle = '#0b1220'
    c.fillRect(0, 0, out.width, out.height)
    c.drawImage(this.renderer.domElement, 0, 0)
    c.drawImage(this.overlay, 0, 0)
    const { view } = this.store.getState()
    const title =
      view.level === 'park'
        ? '全园总平面图'
        : view.level === 'district'
          ? `${this.store.getState().parkData.districts.find((d) => d.id === view.districtId)?.name}平面图`
          : `${this.store.getState().getPool(view.poolId)?.name}平面图`
    c.fillStyle = 'rgba(8,15,28,0.8)'
    c.fillRect(12, 12, 220, 34)
    c.fillStyle = '#e2e8f0'
    c.font = 'bold 16px "Microsoft YaHei", sans-serif'
    c.textAlign = 'left'
    c.textBaseline = 'middle'
    c.fillText(`${title}  ${new Date().toLocaleDateString('zh-CN')}`, 22, 29)
    return out.toDataURL('image/png')
  }

  resize() {
    this.width = this.container.clientWidth
    this.height = this.container.clientHeight
    if (!this.width || !this.height) return
    this.renderer.setSize(this.width, this.height)
    this.overlay.width = this.width
    this.overlay.height = this.height
    this.updateFrustum()
    this.refreshLabels()
  }

  loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    if (this.fly) {
      const k = Math.min(1, (performance.now() - this.fly.t0) / this.fly.dur)
      const e = this.ease(k)
      this.viewH = this.fly.fromH + (this.fly.toH - this.fly.fromH) * e
      this.camera.position.x = this.fly.fromX + (this.fly.toX - this.fly.fromX) * e
      this.camera.position.y = this.fly.fromY + (this.fly.toY - this.fly.fromY) * e
      this.updateFrustum()
      if (k >= 1) this.fly = null
      this.refreshLabels()
    }
    this.renderer.render(this.scene, this.camera)
    this.drawOverlay()
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.unsub?.()
    this.renderer.dispose()
    this.container.removeChild(this.canvas)
    this.container.removeChild(this.overlay)
  }
}
