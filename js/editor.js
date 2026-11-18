/* ============================================================
 * editor.js — Vue3 主应用
 * 画布：笔杆圆周展开图（单位 mm），d3.zoom 缩放/平移，
 * 贝塞尔节点编辑、吸附、布尔运算、环向阵列、窄缝标红、
 * 撤销重做(100步)、SVG 导出、素材批次三级复核放行。
 * ============================================================ */
(function () {
  const { createApp } = Vue;
  const App = window.App;

  const vueApp = createApp({
    data() {
      return {
        doc: App.loadDoc() || App.defaultDoc(),
        tool: 'select',
        rightTab: 'props',
        selectedIds: [],          // 有序：差集按选择顺序
        activePathId: null,
        activeNodeIndex: -1,
        hoverPathId: null,
        cursor: { x: 0, y: 0 },
        zoomK: 1,
        snapIndicator: null,
        pen: null,                // {nodes, previewPt}
        gapMarkers: [],
        minGap: null,
        seamReport: [],
        history: [],
        historyIndex: -1,
        batch: App.loadBatch() || App.defaultBatch(),
        toastMsg: '',
        toastCls: '',
        ui: {
          showGrid: true, showDivisions: true, showCenter: true,
          showGaps: true, snapEnabled: true
        },
        _drag: null,
        _zoom: null,
        _saveTimer: null,
        _toastTimer: null
      };
    },

    computed: {
      circumference() { return Math.PI * this.doc.diameter; },
      divisionLines() {
        const out = [];
        for (let i = 0; i <= this.doc.divisions; i++) {
          out.push({ x: this.doc.widthMm * i / this.doc.divisions, label: i * 360 / this.doc.divisions + '°' });
        }
        return out;
      },
      visibleLayers() { return this.doc.layers.filter(l => l.visible); },
      selectedPaths() {
        return this.selectedIds.map(id => this.doc.paths.find(p => p.id === id)).filter(Boolean);
      },
      activePath() {
        return this.doc.paths.find(p => p.id === this.activePathId) || null;
      },
      editablePaths() {
        // 选中且可见的路径都显示节点，活动路径显示控制柄
        return this.selectedPaths.filter(p => p.visible);
      },
      canUndo() { return this.historyIndex > 0; },
      canRedo() { return this.historyIndex < this.history.length - 1; },
      canBreak() {
        return this.activePath && this.activeNodeIndex >= 0;
      },
      canClose() {
        return this.activePath && !this.activePath.closed && this.activePath.nodes.length >= 3;
      },
      gapPathIds() {
        // 含窄缝的路径 id 集合（窄缝检测标记中记录了两端所属路径）
        const set = new Set();
        this.gapMarkers.forEach(g => { if (g.p1) set.add(g.p1); if (g.p2) set.add(g.p2); });
        return set;
      },
      penPreview() {        if (this.tool !== 'pen' || !this.pen || !this.pen.nodes.length) return null;
        const tmp = App.makePath('preview', this.pen.nodes, { closed: false });
        let d = App.pathD(tmp);
        if (this.pen.previewPt) d += ` L ${App.round3(this.pen.previewPt.x)} ${App.round3(this.pen.previewPt.y)}`;
        return { d, nodes: this.pen.nodes };
      },
      /* ---------- 批次统计 ---------- */
      decidedCount() { return this.batch.items.filter(i => i.decision !== 'pending').length; },
      pendingCount() { return this.batch.items.filter(i => i.decision === 'pending').length; },
      approvedCount() { return this.batch.items.filter(i => i.decision === 'approved').length; },
      rejectedCount() { return this.batch.items.filter(i => i.decision === 'rejected').length; },
      decidePercent() {
        return this.batch.items.length ? this.decidedCount / this.batch.items.length * 100 : 0;
      },
      canRelease() {
        return this.batch.items.length > 0 && this.pendingCount === 0;
      },
      tierCount() {
        const c = { pass: 0, warn: 0, reject: 0 };
        this.batch.items.forEach(i => c[i.tier]++);
        return c;
      }
    },

    mounted() {
      this.initZoom();
      this.initKeyboard();
      this.fitView();
      this.pushHistory();          // 初始快照
      this.$watch(() => JSON.stringify(this.doc), () => this.scheduleSave());
      this.$watch(() => JSON.stringify(this.batch), () => this.scheduleSaveBatch());
      window.addEventListener('resize', () => this.fitView(false));
    },

    methods: {
      pathD: (p) => App.pathD(p),
      round3: App.round3,

      /* ================= 图层 / 路径 ================= */
      pathsOfLayer(layerId) { return this.doc.paths.filter(p => p.layerId === layerId); },
      addLayer() {
        const l = App.makeLayer('图层 ' + (this.doc.layers.length + 1));
        this.doc.layers.push(l);
        this.pushHistory();
      },
      toggleLayer(layer) { layer.visible = !layer.visible; this.pushHistory(); },
      addPath(layerId) {
        const p = App.makePath('新路径 ' + (this.doc.paths.length + 1), [], { layerId });
        this.doc.paths.push(p);
        this.selectOnly(p.id);
        this.tool = 'pen';
        this.pen = { nodes: [], path: p, previewPt: null };
        this.pushHistory();
      },
      removePath(id) {
        const idx = this.doc.paths.findIndex(p => p.id === id);
        if (idx < 0) return;
        this.doc.paths.splice(idx, 1);
        this.selectedIds = this.selectedIds.filter(x => x !== id);
        if (this.activePathId === id) { this.activePathId = null; this.activeNodeIndex = -1; }
        this.gapMarkers = []; this.minGap = null;
        this.pushHistory();
      },
      selectPath(id, ev) {
        if (this.tool === 'pen') return;
        if (ev && (ev.ctrlKey || ev.metaKey || ev.shiftKey)) {
          const i = this.selectedIds.indexOf(id);
          if (i >= 0) this.selectedIds.splice(i, 1);
          else this.selectedIds.push(id);
        } else {
          this.selectOnly(id);
        }
        this.activePathId = this.selectedIds[this.selectedIds.length - 1] || null;
      },
      selectOnly(id) {
        this.selectedIds = id ? [id] : [];
        this.activePathId = id;
        this.activeNodeIndex = -1;
      },
      strokeOf(p) {
        if (this.gapMarkers.length && this.ui.showGaps && this.gapPathIds.has(p.id)) return '#ff1a1a';
        return p.color;
      },
      strokeWidthOf(p) {
        return this.selectedIds.includes(p.id) ? 0.42 : 0.28;
      },

      /* ================= 节点控制柄辅助 ================= */
      handleLines(p) {
        const out = [];
        p.nodes.forEach((n, i) => {
          if (n.c1 && (i > 0 || p.closed)) {
            out.push({ x1: n.x, y1: n.y, x2: n.x + n.c1.dx, y2: n.y + n.c1.dy });
          }
          if (n.c2 && (i < p.nodes.length - 1 || p.closed)) {
            out.push({ x1: n.x, y1: n.y, x2: n.x + n.c2.dx, y2: n.y + n.c2.dy });
          }
        });
        return out;
      },
      controlPoints(p) {
        const out = [];
        p.nodes.forEach((n, i) => {
          if (n.c1 && (i > 0 || p.closed)) out.push({ x: n.x + n.c1.dx, y: n.y + n.c1.dy, node: i, which: 'c1' });
          if (n.c2 && (i < p.nodes.length - 1 || p.closed)) out.push({ x: n.x + n.c2.dx, y: n.y + n.c2.dy, node: i, which: 'c2' });
        });
        return out;
      },

      /* ================= 视图 / d3.zoom ================= */
      initZoom() {
        const svg = d3.select(this.$refs.svgRef);
        this._zoom = d3.zoom()
          .scaleExtent([0.2, 40])
          .filter((ev) => {
            if (ev.type === 'mousedown') {
              // 平移：中键、右键，或选择工具下的空白拖拽
              if (ev.button === 1 || ev.button === 2) return true;
              return ev.target === this.$refs.svgRef || ev.target.tagName === 'rect' || ev.target.tagName === 'line';
            }
            return true;
          })
          .on('zoom', (ev) => {
            const t = ev.transform;
            this.zoomK = t.k;
            this.$refs.rootRef.setAttribute('transform', `translate(${t.x},${t.y}) scale(${t.k})`);
          });
        svg.call(this._zoom);
        svg.on('pointermove', this.onCanvasMove);
        svg.on('pointerdown', this.onCanvasDown);
        svg.on('dblclick.zoom', null);
        svg.on('dblclick', () => {
          if (this.tool === 'pen' && this.pen && this.pen.nodes.length >= 2) this.finishPen(false);
        });
        svg.on('contextmenu', (ev) => ev.preventDefault());
      },
      fitView(animate = true) {
        this.$nextTick(() => {
          const wrap = this.$refs.wrapRef;
          if (!wrap) return;
          const w = wrap.clientWidth, h = wrap.clientHeight;
          const pad = 30;
          const k = Math.min((w - pad * 2) / this.doc.widthMm, (h - pad * 2) / this.doc.heightMm);
          const x = (w - this.doc.widthMm * k) / 2;
          const y = (h - this.doc.heightMm * k) / 2;
          const sel = d3.select(this.$refs.svgRef);
          const t = d3.zoomIdentity.translate(x, y).scale(k);
          if (animate) sel.transition().duration(250).call(this._zoom.transform, t);
          else sel.call(this._zoom.transform, t);
        });
      },
      toLocal(ev) {
        const pt = d3.pointer(ev, this.$refs.rootRef);
        return { x: pt[0], y: pt[1] };
      },

      /* ================= 指针交互 ================= */
      onCanvasDown(ev) {
        const local = this.toLocal(ev);
        if (this.tool === 'pen') {
          // 落在背景空白：开始/继续手绘
          if (ev.target.tagName === 'circle' || ev.target.tagName === 'path') return;
          this.penPointerDown(local, ev);
        } else if (ev.target === this.$refs.svgRef || ev.target.tagName === 'rect') {
          // 空白单击：清除选择（平移由 d3.zoom filter 接管）
          if (!ev.button) this.selectOnly(null);
        }
      },
      onCanvasMove(ev) {
        const local = this.toLocal(ev);
        this.cursor = { x: local.x, y: local.y };
        if (this._drag) this.applyDrag(local, ev);
        if (this.tool === 'pen' && this.pen) this.pen.previewPt = local;
      },
      onPathHover(ev, p) { this.hoverPathId = p.id; },
      onPathPointerDown(ev, p) {
        if (this.tool === 'pen') return;
        if (ev.detail === 2) { this.insertAtPointer(p, ev); return; }
        if (!this.selectedIds.includes(p.id)) this.selectPath(p.id, ev);
        else if (!(ev.ctrlKey || ev.metaKey || ev.shiftKey)) this.selectOnly(p.id);
        // 路径整体拖动（在填充/描边上按下且未命中节点）
        if (this.tool === 'select' && ev.button === 0) {
          const local = this.toLocal(ev);
          this._drag = {
            kind: 'path', path: p,
            start: local,
            orig: p.nodes.map(n => ({ x: n.x, y: n.y })),
            moved: false,
            shift: ev.shiftKey
          };
          window.addEventListener('pointerup', this.endDrag, { once: true });
        }
      },
      onNodePointerDown(ev, p, i) {
        if (this.tool !== 'select') return;
        ev.stopPropagation();
        this.activePathId = p.id;
        this.activeNodeIndex = i;
        if (!this.selectedIds.includes(p.id)) this.selectOnly(p.id);
        const local = this.toLocal(ev);
        this._drag = {
          kind: 'node', path: p, index: i,
          start: local, origNode: App.cloneNode(p.nodes[i]),
          moved: false, shift: ev.shiftKey
        };
        window.addEventListener('pointerup', this.endDrag, { once: true });
      },
      onControlPointerDown(ev, p, idxInfo) {
        if (this.tool !== 'select') return;
        ev.stopPropagation();
        const local = this.toLocal(ev);
        this._drag = {
          kind: 'handle', path: p, node: idxInfo.node, which: idxInfo.which,
          start: local, breakMirror: ev.ctrlKey, moved: false, shift: ev.shiftKey
        };
        window.addEventListener('pointerup', this.endDrag, { once: true });
      },

      applyDrag(local, ev) {
        const dg = this._drag;
        dg.moved = true;
        const dx = local.x - dg.start.x, dy = local.y - dg.start.y;
        if (dg.kind === 'path') {
          let nx = local.x, ny = local.y, label = null;
          const anchor = dg.orig[0];
          const snapped = this.trySnap({ x: anchor.x + dx, y: anchor.y + dy }, dg.path, ev);
          if (snapped) { nx = snapped.x; ny = snapped.y; label = snapped.label; }
          else { nx = anchor.x + dx; ny = anchor.y + dy; }
          const adx = nx - anchor.x, ady = ny - anchor.y;
          dg.path.nodes.forEach((n, i) => { n.x = App.round3(dg.orig[i].x + adx); n.y = App.round3(dg.orig[i].y + ady); });
          this.snapIndicator = label ? { x: nx, y: ny, label } : null;
        } else if (dg.kind === 'node') {
          const n = dg.path.nodes[dg.index];
          const target = this.trySnap({ x: dg.origNode.x + dx, y: dg.origNode.y + dy }, dg.path, ev);
          if (target) {
            n.x = target.x; n.y = target.y;
            this.snapIndicator = { x: target.x, y: target.y, label: target.label };
          } else {
            n.x = App.round3(dg.origNode.x + dx); n.y = App.round3(dg.origNode.y + dy);
            this.snapIndicator = null;
          }
          // 控制柄随节点平移
          (['c1', 'c2']).forEach(k => {
            if (dg.origNode[k]) n[k] = { dx: dg.origNode[k].dx, dy: dg.origNode[k].dy };
          });
        } else if (dg.kind === 'handle') {
          const n = dg.path.nodes[dg.node];
          const hx = local.x - n.x, hy = local.y - n.y;
          n[dg.which] = { dx: App.round3(hx), dy: App.round3(hy) };
          const other = dg.which === 'c1' ? 'c2' : 'c1';
          if (!dg.breakMirror) {
            // 平滑镜像：保持 C1 连续
            n[other] = { dx: App.round3(-hx), dy: App.round3(-hy) };
          }
        }
      },
      endDrag() {
        if (this._drag && this._drag.moved) this.pushHistory();
        this._drag = null;
        this.snapIndicator = null;
      },
      trySnap(pos, activePath, ev) {
        if (!this.ui.snapEnabled || (ev && ev.shiftKey)) return null;
        return App.snap(pos, {
          doc: this.doc,
          paths: this.doc.paths.filter(p => p.visible),
          activePath,
          tolerance: App.SNAP_TOL_MM,
          gridOn: this.ui.showGrid,
          centerOn: this.ui.showCenter,
          endpointOn: true
        });
      },

      /* ================= 贝塞尔笔 ================= */
      penPointerDown(local, ev) {
        if (!this.pen) this.pen = { nodes: [], path: null, previewPt: null };
        const snapped = this.trySnap(local, null, ev);
        const pt = snapped || { x: App.round3(local.x), y: App.round3(local.y) };
        if (snapped) this.snapIndicator = { x: pt.x, y: pt.y, label: snapped.label };
        this.pen.nodes.push(App.makeNode(pt.x, pt.y));
        if (this.pen.nodes.length >= 2) {
          // 新节点默认带上零控制柄，便于后续转曲线
          const last = this.pen.nodes[this.pen.nodes.length - 1];
          last.c1 = { dx: 0, dy: 0 };
          this.pen.nodes[this.pen.nodes.length - 2].c2 = { dx: 0, dy: 0 };
        }
      },
      finishPen(close = false) {
        if (!this.pen || this.pen.nodes.length < 2) {
          this.toast('至少两个节点才能形成路径', 'bad');
          return;
        }
        const nodes = this.pen.nodes;
        // 双击收尾会产生一个重复末节点，去除
        const a0 = nodes[nodes.length - 1], a1 = nodes[nodes.length - 2];
        if (Math.hypot(a0.x - a1.x, a0.y - a1.y) < 1e-6) nodes.pop();
        nodes.forEach(n => { if (n.c1 && n.c1.dx === 0 && n.c1.dy === 0) n.c1 = null;
                             if (n.c2 && n.c2.dx === 0 && n.c2.dy === 0) n.c2 = null; });
        let target = this.pen.path;
        if (target) {
          target.nodes = nodes; target.closed = close;
        } else {
          const layerId = (this.doc.layers[0] || App.makeLayer('图层1')).id;
          if (!this.doc.layers.length) this.doc.layers.push({ id: layerId, name: '图层1', visible: true });
          target = App.makePath('手绘纹样 ' + (this.doc.paths.length + 1), nodes, { layerId, closed: close });
          this.doc.paths.push(target);
        }
        this.pen = null;
        this.tool = 'select';
        this.selectOnly(target.id);
        this.pushHistory();
        this.toast('路径已保存：' + target.name, 'ok');
      },

      /* ================= 节点工具：加节点 / 断开 / 闭合 ================= */
      insertAtPointer(p, ev) {
        const local = this.toLocal(ev);
        const idx = App.insertNodeNear(p, local);
        if (idx != null) {
          this.activePathId = p.id; this.activeNodeIndex = idx;
          this.pushHistory();
          this.toast('已在最近线段插入节点');
        }
      },
      addNodeAtPoint() {
        const p = this.activePath;
        if (!p || !p.nodes.length) return this.toast('请先选中一条路径', 'bad');
        // 在路径中点（第一段 50% 处）插入
        const fake = { x: (p.nodes[0].x + p.nodes[1 % p.nodes.length].x) / 2,
                       y: (p.nodes[0].y + p.nodes[1 % p.nodes.length].y) / 2 };
        const idx = App.insertNodeNear(p, fake);
        if (idx != null) { this.activeNodeIndex = idx; this.pushHistory(); this.toast('已插入节点'); }
      },
      breakNode() {
        const p = this.activePath;
        if (!p || this.activeNodeIndex < 0) return;
        const result = App.breakAtNode(p, this.activeNodeIndex);
        if (!result) return;
        if (result.length === 1) {
          this.pushHistory();
        } else {
          const layerId = p.layerId;
          const pos = this.doc.paths.findIndex(x => x.id === p.id);
          this.doc.paths.splice(pos, 1, ...result);
          this.selectedIds = result.map(x => x.id);
          this.activePathId = result[0].id;
          this.pushHistory();
        }
        this.activeNodeIndex = -1;
        this.toast('路径已在节点处断开');
      },
      closePath() {
        const p = this.activePath;
        if (!p) return;
        if (App.closeOpenPath(p)) { this.pushHistory(); this.toast('路径已闭合', 'ok'); }
      },
      deleteActiveNodeOrPath() {
        const p = this.activePath;
        if (!p) return;
        if (this.activeNodeIndex >= 0 && p.nodes.length > 2) {
          p.nodes.splice(this.activeNodeIndex, 1);
          this.activeNodeIndex = -1;
          this.pushHistory();
        } else {
          this.removePath(p.id);
        }
      },

      /* ================= 布尔运算 ================= */
      booleanOp(op) {
        const sel = this.selectedPaths;
        if (sel.length !== 2) return this.toast('请按住 Ctrl 点选两条路径', 'bad');
        if (!sel[0].closed || !sel[1].closed) {
          return this.toast('布尔运算要求两条路径均为闭合路径，请先闭合', 'bad');
        }
        const subs = App.booleanPaths(sel[0], sel[1], op);
        if (!subs) return this.toast('布尔运算失败：路径可能存在自交或重合边', 'bad');
        const opName = App.BOOLEAN_OP_NAMES[op];
        const originalD = { a: App.pathD(sel[0]), b: App.pathD(sel[1]), op };
        const layerId = sel[0].layerId;
        const created = subs.map((s, i) => App.makePath(
          `${opName}-${sel[0].name}×${sel[1].name}${subs.length > 1 ? '-' + (i + 1) : ''}`,
          s.nodes, {
            layerId, closed: s.closed, color: '#7a4fd0',
            fill: 'rgba(122,79,208,0.12)',
            sourcePaths: [sel[0].name, sel[1].name],
            originalD: JSON.stringify(originalD)
          }));
        // 原始路径隐藏保留（导出 SVG 仍带原始 d）
        sel.forEach(p => { p.visible = false; });
        const pos = this.doc.paths.findIndex(x => x.id === sel[0].id);
        this.doc.paths.splice(pos + 1, 0, ...created);
        this.selectedIds = created.map(c => c.id);
        this.activePathId = created[0].id;
        this.pushHistory();
        this.runGapCheck();
        this.rightTab = 'props';
        this.toast(`${opName}完成，已自动执行 0.3mm 窄缝检查`, 'ok');
      },

      /* ================= 环向阵列 ×3 ================= */
      circumferentialArray() {
        const sel = this.selectedPaths;
        if (!sel.length) return;
        const W = this.doc.widthMm;
        const step = W / 3;
        const created = [];
        sel.forEach(p => {
          p.visible = false;   // 源路径保留但隐藏
          for (let copy = 0; copy < 3; copy++) {
            const pieces = App.offsetWrapped(p, step * copy, W, `-阵列${copy + 1}`);
            pieces.forEach(np => {
              np.arrayMeta = { source: p.name, copy };
              created.push(np);
            });
          }
        });
        this.doc.paths.push(...created);
        this.selectedIds = created.map(c => c.id);
        this.activePathId = created[0] && created[0].id;
        this.seamReport = App.seamCheck(created, W);
        this.pushHistory();
        const bad = this.seamReport.filter(r => !r.ok).length;
        this.toast(bad
          ? `环向阵列完成：${this.seamReport.length} 条接缝，${bad} 条首尾未对齐，请查看右侧校验`
          : '环向阵列完成，三份纹样首尾接缝对齐', bad ? 'bad' : 'ok');
        this.rightTab = 'props';
      },

      /* ================= 窄缝检查 ================= */
      runGapCheck() {
        const res = App.detectGaps(this.doc.paths.filter(p => p.visible));
        this.gapMarkers = res.markers;
        this.minGap = res.minGap;
        if (res.markers.length) {
          this.ui.showGaps = true;
          this.toast(`发现 ${res.markers.length} 处窄缝（<0.3mm），已标红，激光雕刻无法成型`, 'bad');
        } else {
          this.toast('窄缝检查通过：未发现小于 0.3mm 的间隙', 'ok');
        }
      },

      /* ================= 文档参数 ================= */
      onDocParamChange() {
        this.doc.diameter = Math.max(1, this.doc.diameter || 1);
        this.doc.heightMm = Math.max(1, this.doc.heightMm || 1);
        this.doc.divisions = Math.max(1, this.doc.divisions || 1);
        this.doc.gridMm = Math.max(0.2, this.doc.gridMm || 1);
        // 展开长跟随周长（用户手改后以手改为准，不再强制覆盖）
        if (!this._widthTouched) this.doc.widthMm = App.round3(this.circumference);
        this.doc.widthMm = Math.max(1, this.doc.widthMm || 1);
        this.pushHistory();
        this.fitView(false);
      },
      onWidthInput() { this._widthTouched = true; },

      /* ================= 撤销 / 重做（100 步） ================= */
      snapshot() { return JSON.stringify(this.doc); },
      pushHistory() {
        const snap = this.snapshot();
        if (this.history[this.historyIndex] === snap) return;
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(snap);
        if (this.history.length > App.HISTORY_LIMIT) this.history.shift();
        this.historyIndex = this.history.length - 1;
      },
      undo() {
        if (!this.canUndo) return;
        this.historyIndex--;
        this.restoreHistory();
      },
      redo() {
        if (!this.canRedo) return;
        this.historyIndex++;
        this.restoreHistory();
      },
      restoreHistory() {
        const restored = JSON.parse(this.history[this.historyIndex]);
        this.doc = restored;
        this.selectedIds = []; this.activePathId = null; this.activeNodeIndex = -1;
        this.gapMarkers = []; this.minGap = null; this.pen = null;
      },

      /* ================= SVG 导出（保留图层分组与原始路径数据） ================= */
      exportSVG() {
        const W = this.doc.widthMm, H = this.doc.heightMm;
        const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const lines = [];
        lines.push(`<?xml version="1.0" encoding="UTF-8"?>`);
        lines.push(`<svg xmlns="http://www.w3.org/2000/svg" `
          + `width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}" `
          + `data-diameter-mm="${this.doc.diameter}" data-circumference-mm="${App.round3(W)}" `
          + `data-height-mm="${H}" data-divisions="${this.doc.divisions}">`);
        lines.push(`<metadata><![CDATA[`
          + JSON.stringify({
            tool: '笔杆雕刻工作站',
            diameterMm: this.doc.diameter,
            circumferenceMm: W, heightMm: H, divisions: this.doc.divisions,
            exportedAt: new Date().toISOString(),
            gapCheck: { limitMm: App.GAP_LIMIT_MM, found: this.gapMarkers.length, minGap: this.minGap }
          }, null, 2) + `]]></metadata>`);

        // 参考线组（雕刻机可忽略的辅助图层）
        lines.push(`<g id="参考线" data-role="guides" opacity="0.6">`);
        for (let i = 1; i < this.doc.divisions; i++) {
          const x = W * i / this.doc.divisions;
          lines.push(`<line x1="${App.round3(x)}" y1="0" x2="${App.round3(x)}" y2="${H}" stroke="#d8b46a" stroke-width="0.12" stroke-dasharray="1.2 1.0"/>`);
        }
        lines.push(`<line x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}" stroke="#4f8cff" stroke-width="0.14" stroke-dasharray="2.2 1.4"/>`);
        lines.push(`</g>`);

        // 图层分组（与画布结构一致）
        this.doc.layers.forEach(layer => {
          lines.push(`<g id="${esc(layer.name)}" data-layer-id="${esc(layer.id)}" ${layer.visible ? '' : 'display="none"'}>`);
          this.pathsOfLayer(layer.id).forEach(p => {
            const meta = [];
            if (p.sourcePaths) meta.push('boolean-source=' + JSON.stringify(p.sourcePaths.join('|')));
            if (p.arrayMeta) meta.push('array=' + p.arrayMeta.source + '#copy' + p.arrayMeta.copy);
            lines.push(`<path id="${esc(p.id)}" data-name="${esc(p.name)}" d="${App.pathD(p)}" `
              + `fill="${p.closed ? esc(p.fill) : 'none'}" stroke="${esc(p.color)}" stroke-width="0.25" `
              + `fill-rule="evenodd" ${p.visible ? '' : 'display="none"'} `
              + (meta.length ? `data-meta="${esc(meta.join(';'))}" ` : '')
              + (p.originalD ? `data-original-paths="${esc(p.originalD)}" ` : '') + '/>');
          });
          lines.push(`</g>`);
        });

        // 原始路径数据归档（布尔运算前的 d，独立隐藏组，不参与雕刻）
        const archived = this.doc.paths.filter(p => p.originalD);
        if (archived.length) {
          lines.push(`<g id="原始路径数据归档" data-role="original-path-data" display="none">`);
          archived.forEach(p => {
            lines.push(`<path id="${esc(p.id)}-original" data-name="${esc(p.name)}-原始" `
              + `data-original-paths="${esc(p.originalD)}" d="${App.pathD(p)}"/>`);
          });
          lines.push(`</g>`);
        }
        lines.push(`</svg>`);
        App.downloadText(`笔杆纹样_${App.round3(W)}x${App.round3(H)}mm.svg`, lines.join('\n'), 'image/svg+xml;charset=utf-8');
        this.toast('SVG 已导出：图层分组、原始路径 d、参考线均已保留', 'ok');
      },

      /* ================= 批次：自动检查 / 复核 / 放行 ================= */
      tierText(t) { return { pass: '合格', warn: '警告', reject: '退回' }[t]; },
      lineWidthStyle(it) {
        return it.minLineWidthMm < this.batch.thresholds.minLineWidthMm
          ? (it.minLineWidthMm < App.GAP_LIMIT_MM ? 'color:var(--bad)' : 'color:var(--warn)') : '';
      },
      breaksStyle(it) {
        return it.breaks > this.batch.thresholds.maxBreaks ? 'color:var(--warn)' : '';
      },
      loadSampleBatch() {
        this.batch = App.sampleBatch();
        this.toast('已载入 12 条示例素材并完成自动分级', 'ok');
      },
      rerunAutoCheck() {
        App.runAutoCheck(this.batch);
      },
      approveItem(item) {
        item.decision = 'approved';
        item.reason = ''; item.showReason = false;
        item.decidedAt = new Date().toISOString();
        this.toast(`${item.id} 已确认通过`);
      },
      toggleReason(item) { item.showReason = !item.showReason; },
      rejectItem(item) {
        const reason = (item.reasonDraft || '').trim();
        if (!reason) return this.toast('驳回必须填写退回原因，供应商需要据此整改', 'bad');
        item.decision = 'rejected';
        item.reason = reason;
        item.showReason = false;
        item.decidedAt = new Date().toISOString();
        this.toast(`${item.id} 已驳回，原因将随退回清单返回供应商`, 'bad');
      },
      releaseBatch() {
        if (!this.canRelease) return;
        const manifest = {
          batch: this.batch.name,
          releasedAt: new Date().toISOString(),
          thresholds: this.batch.thresholds,
          summary: {
            total: this.batch.items.length,
            approved: this.approvedCount,
            rejected: this.rejectedCount,
            tiers: this.tierCount
          },
          // 放行给雕刻组的只有复核通过项
          releasedItems: this.batch.items
            .filter(i => i.decision === 'approved')
            .map(i => ({ id: i.id, supplier: i.supplier, tier: i.tier,
              minLineWidthMm: i.minLineWidthMm, breaks: i.breaks }))
        };
        App.downloadJSON(`放行单_${this.batch.name}.json`, manifest);
        this.toast(`整批放行：${this.approvedCount} 条交付雕刻组，${this.rejectedCount} 条退回供应商`, 'ok');
      },
      exportRejects() {
        const rejects = this.batch.items.filter(i => i.decision === 'rejected');
        if (!rejects.length) return;
        const payload = {
          batch: this.batch.name,
          returnedAt: new Date().toISOString(),
          note: '以下素材未通过复核，请按原因整改后重新提交',
          items: rejects.map(i => ({
            id: i.id, supplier: i.supplier, autoTier: i.tier,
            minLineWidthMm: i.minLineWidthMm, breaks: i.breaks,
            narrowGaps: i.narrowGaps, reason: i.reason
          }))
        };
        App.downloadJSON(`退回清单_${this.batch.name}.json`, payload);
        this.toast(`退回清单已导出（${rejects.length} 条，含整改原因）`, 'ok');
      },
      importBatch(ev) {
        const file = ev.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result);
            if (!Array.isArray(data.items)) throw new Error('缺少 items 数组');
            data.items.forEach(it => {
              it.decision = it.decision || 'pending';
              it.reasonDraft = ''; it.showReason = false;
            });
            data.thresholds = data.thresholds || this.batch.thresholds;
            this.batch = { name: data.name || this.batch.name,
              thresholds: data.thresholds, items: data.items };
            App.runAutoCheck(this.batch);
            this.toast(`已导入 ${data.items.length} 条素材并重新自动分级`, 'ok');
          } catch (e) {
            this.toast('导入失败：' + e.message, 'bad');
          }
          ev.target.value = '';
        };
        reader.readAsText(file);
      },

      /* ================= 持久化 / 键盘 / 提示 ================= */
      scheduleSave() {
        clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(() => App.saveDoc(this.doc), 400);
      },
      scheduleSaveBatch() {
        clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(() => App.saveBatch(this.batch), 400);
      },
      initKeyboard() {
        window.addEventListener('keydown', (ev) => {
          const tag = (ev.target.tagName || '').toLowerCase();
          if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
          if (ev.ctrlKey || ev.metaKey) {
            if (ev.key.toLowerCase() === 'z') { ev.preventDefault(); ev.shiftKey ? this.redo() : this.undo(); }
            if (ev.key.toLowerCase() === 'y') { ev.preventDefault(); this.redo(); }
            return;
          }
          switch (ev.key.toLowerCase()) {
            case 'v': this.tool = 'select'; break;
            case 'p': this.tool = 'pen'; if (!this.pen) this.pen = { nodes: [], path: null, previewPt: null }; break;
            case 'escape':
              if (this.pen) { this.pen = null; }
              else this.selectOnly(null);
              break;
            case 'enter':
              if (this.tool === 'pen' && this.pen) this.finishPen(false);
              break;
            case 'delete':
            case 'backspace':
              this.deleteActiveNodeOrPath(); break;
          }
        });
      },
      toast(msg, cls = '') {
        this.toastMsg = msg; this.toastCls = cls;
        clearTimeout(this._toastTimer);
        this.$nextTick(() => {
          const el = document.getElementById('toast');
          if (el) el.classList.add('show');
        });
        this._toastTimer = setTimeout(() => {
          const el = document.getElementById('toast');
          if (el) el.classList.remove('show');
        }, 2800);
      }
    }
  }).mount('#app');
  // 暴露组件实例供自动化测试/外部排障使用
  window.__brushStationVM = vueApp;
})();
