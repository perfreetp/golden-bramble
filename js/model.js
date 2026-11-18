/* ============================================================
 * model.js — 全局命名空间、数据模型、默认文档、持久化
 * 画布坐标单位统一为 mm（SVG 内部坐标系即 mm）
 * ============================================================ */
(function () {
  const App = window.App || (window.App = {});

  App.GAP_LIMIT_MM = 0.3;          // 窄缝物理阈值：激光最小刀缝约 0.3mm
  App.HISTORY_LIMIT = 100;         // 撤销栈上限（要求 ≥50）
  App.SNAP_TOL_MM = 1.0;           // 吸附容差
  App.STORAGE_KEY_DOC = 'brush-station-doc-v1';
  App.STORAGE_KEY_BATCH = 'brush-station-batch-v1';

  let seq = 1;
  App.uid = function (prefix) {
    return prefix + '_' + (Date.now().toString(36)) + '_' + (seq++).toString(36);
  };

  App.makeNode = function (x, y, c1, c2) {
    // c1: 入向控制柄（相对前一节点），c2: 出向控制柄（相对本节点）；null 表示该段为直线
    return {
      x: round3(x), y: round3(y),
      c1: c1 ? { dx: round3(c1.dx), dy: round3(c1.dy) } : null,
      c2: c2 ? { dx: round3(c2.dx), dy: round3(c2.dy) } : null
    };
  };

  App.makePath = function (name, nodes, opts = {}) {
    return {
      id: App.uid('p'),
      name,
      layerId: opts.layerId || null,
      nodes: nodes || [],
      closed: !!opts.closed,
      color: opts.color || '#c0392b',
      fill: opts.fill || 'rgba(192,57,43,0.08)',
      visible: true,
      sourcePaths: opts.sourcePaths || null,     // 布尔来源路径名
      originalD: opts.originalD || null,         // 布尔运算保留的原始 d
      arrayMeta: opts.arrayMeta || null,         // {source, copy}
      wrap: opts.wrap || false                   // 是否为跨接缝被切分的路径
    };
  };

  App.makeLayer = function (name) {
    return { id: App.uid('L'), name, visible: true };
  };

  function round3(v) { return Math.round(v * 1000) / 1000; }
  App.round3 = round3;

  /* ---------------- 默认示例文档：一朵四瓣花 + 环向等分 ---------------- */
  App.defaultDoc = function () {
    const diameter = 12;
    const widthMm = round3(Math.PI * diameter);      // 37.699mm
    const heightMm = 40;
    const layer1 = App.makeLayer('主纹样层');
    const layer2 = App.makeLayer('辅助边饰层');

    // 四瓣花（闭合贝塞尔），居中偏左，供首次环向阵列演示
    const cx = widthMm / 4, cy = heightMm / 2, r = 4.2;
    const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    const nodes = dirs.map(([dx, dy]) => {
      const tx = -dy, ty = dx; // 切向
      return App.makeNode(cx + dx * r, cy + dy * r,
        { dx: tx * r * 0.45, dy: ty * r * 0.45 },
        { dx: -tx * r * 0.45, dy: -ty * r * 0.45 });
    });
    const flower = App.makePath('四瓣花纹样', nodes, {
      layerId: layer1.id, closed: true, color: '#c0392b'
    });

    // 一条开放的卷草纹（演示开放路径与断开/闭合工具）
    const scroll = App.makePath('卷草纹', [
      App.makeNode(2, 34),
      App.makeNode(6, 30, null, { dx: 1.6, dy: 1.0 }),
      App.makeNode(9, 33, { dx: -1.4, dy: 1.2 }, null),
      App.makeNode(12, 28, null, { dx: 1.2, dy: -1.6 })
    ], { layerId: layer2.id, color: '#8e6f2f', fill: 'rgba(142,111,47,0.08)' });

    return {
      diameter,
      widthMm,
      heightMm,
      divisions: 4,
      gridMm: 1,
      layers: [layer1, layer2],
      paths: [flower, scroll]
    };
  };

  /* ---------------- 持久化 ---------------- */
  App.saveDoc = function (doc) {
    try { localStorage.setItem(App.STORAGE_KEY_DOC, JSON.stringify(doc)); } catch (e) {}
  };
  App.loadDoc = function () {
    try {
      const raw = localStorage.getItem(App.STORAGE_KEY_DOC);
      if (!raw) return null;
      const doc = JSON.parse(raw);
      if (doc && doc.layers && doc.paths) return doc;
    } catch (e) {}
    return null;
  };
  App.saveBatch = function (batch) {
    try { localStorage.setItem(App.STORAGE_KEY_BATCH, JSON.stringify(batch)); } catch (e) {}
  };
  App.loadBatch = function () {
    try {
      const raw = localStorage.getItem(App.STORAGE_KEY_BATCH);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  };
})();
