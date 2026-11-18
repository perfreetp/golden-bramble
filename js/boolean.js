/* ============================================================
 * boolean.js — 路径布尔运算（并集 / 差集 / 交集）
 * 基于 paper.js 的路径代数；运算前记录两条原始 d 随结果保留，
 * 导出 SVG 时写入 <metadata> 与隐藏图层，满足“保留原始路径数据”。
 * ============================================================ */
(function () {
  const App = window.App;
  let scope = null;

  function getScope() {
    if (scope) return scope;
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    scope = new paper.PaperScope();
    scope.setup(canvas);
    return scope;
  }

  // 简易 SVG path d 解析（M/L/C/Z/Q，相对命令统一转绝对）
  function parseD(d) {
    const tokens = d.match(/[MLCQZmlcqz]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || [];
    const subs = [];
    let cur = null, start = null, cmd = null;
    let cx = 0, cy = 0;
    const num = i => parseFloat(tokens[i]);
    let i = 0;
    const push = (x, y, c1, c2) => {
      const nd = App.makeNode(x, y, c1, c2);
      cur.nodes.push(nd);
      cx = x; cy = y;
    };
    while (i < tokens.length) {
      const t = tokens[i];
      if (/^[MLCQZmlcqz]$/.test(t)) { cmd = t; i++; continue; }
      const rel = cmd === cmd.toLowerCase();
      switch (cmd.toUpperCase()) {
        case 'M': {
          if (cur) subs.push(cur);
          const x = num(i) + (rel ? cx : 0), y = num(i + 1) + (rel ? cy : 0);
          i += 2;
          cur = { nodes: [], closed: false };
          start = { x, y };
          push(x, y);
          cmd = rel ? 'l' : 'L';
          break;
        }
        case 'L': {
          const x = num(i) + (rel ? cx : 0), y = num(i + 1) + (rel ? cy : 0);
          i += 2;
          push(x, y);
          break;
        }
        case 'C': {
          const c1x = num(i) + (rel ? cx : 0), c1y = num(i + 1) + (rel ? cy : 0);
          const c2x = num(i + 2) + (rel ? cx : 0), c2y = num(i + 3) + (rel ? cy : 0);
          const x = num(i + 4) + (rel ? cx : 0), y = num(i + 5) + (rel ? cy : 0);
          i += 6;
          const prev = cur.nodes[cur.nodes.length - 1];
          prev.c2 = { dx: App.round3(c1x - prev.x), dy: App.round3(c1y - prev.y) };
          push(x, y, { dx: App.round3(c2x - x), dy: App.round3(c2y - y) }, null);
          break;
        }
        case 'Q': {
          // 二次贝塞尔升阶为三次
          const qx = num(i) + (rel ? cx : 0), qy = num(i + 1) + (rel ? cy : 0);
          const x = num(i + 2) + (rel ? cx : 0), y = num(i + 3) + (rel ? cy : 0);
          i += 4;
          const prev = cur.nodes[cur.nodes.length - 1];
          const c1x = prev.x + 2 / 3 * (qx - prev.x), c1y = prev.y + 2 / 3 * (qy - prev.y);
          const c2x = x + 2 / 3 * (qx - x), c2y = y + 2 / 3 * (qy - y);
          prev.c2 = { dx: App.round3(c1x - prev.x), dy: App.round3(c1y - prev.y) };
          push(x, y, { dx: App.round3(c2x - x), dy: App.round3(c2y - y) }, null);
          break;
        }
        case 'Z': {
          cur.closed = true;
          cx = start.x; cy = start.y;
          subs.push(cur); cur = null;
          break;
        }
        default:
          i++;
      }
    }
    if (cur) subs.push(cur);
    return subs;
  }

  function toPaperItem(ps, d) {
    const sc = getScope();
    const item = sc.project.importSVG(
      `<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`,
      { applyMatrix: true, insert: false });
    // importSVG 对完整 svg 字符串返回 Group（svg 根节点），需要取出内部 Path/CompoundPath
    if (!item || item.className === 'Group') {
      const subs = parseD(d);
      const cp = new sc.CompoundPath({ insert: false });
      subs.forEach(s => {
        const pp = new sc.Path({ insert: false, closed: s.closed });
        s.nodes.forEach((nd, k) => {
          if (k === 0) pp.add(new sc.Point(nd.x, nd.y));
          else if (nd.c1) {
            const prev = s.nodes[k - 1];
            pp.cubicCurveTo(
              new sc.Point(prev.x + (prev.c2 ? prev.c2.dx : 0), prev.y + (prev.c2 ? prev.c2.dy : 0)),
              new sc.Point(nd.x + nd.c1.dx, nd.y + nd.c1.dy),
              new sc.Point(nd.x, nd.y));
          } else {
            pp.add(new sc.Point(nd.x, nd.y));
          }
        });
        if (s.closed) pp.closePath();
        cp.addChild(pp);
      });
      // 单闭合子路径直接返回 Path，布尔运算兼容性最好
      if (cp.children.length === 1 && cp.children[0].closed) {
        const only = cp.children[0];
        cp.removeChildren();
        return only;
      }
      return cp;
    }
    return item;
  }

  // 把 paper 结果（Path / CompoundPath）转回内部路径模型的子路径数组
  function fromPaperItem(result) {
    const out = [];
    const walk = item => {
      if (item.className === 'Path') {
        const nodes = [];
        item.segments.forEach(seg => {
          // paper 的 handleIn 即本节点的入向控制柄（相对坐标）
          nodes.push(App.makeNode(seg.point.x, seg.point.y,
            { dx: seg.handleIn.x, dy: seg.handleIn.y },
            { dx: seg.handleOut.x, dy: seg.handleOut.y }));
        });
        if (nodes.length) {
          if (!item.closed) {
            nodes[0].c1 = null;
            nodes[nodes.length - 1].c2 = null;
          }
          out.push({ nodes, closed: item.closed });
        }
      } else if (item.children) {
        item.children.forEach(walk);
      }
    };
    walk(result);
    return out;
  }

  /**
   * 对两条内部路径执行布尔运算
   * @param op 'unite' | 'subtract' | 'intersect'
   * @returns [{nodes, closed}] 子路径数组；失败返回 null
   */
  App.booleanPaths = function (pathA, pathB, op) {
    const sc = getScope();
    sc.project.clear();
    const dA = App.pathD(pathA), dB = App.pathD(pathB);
    const a = toPaperItem(null, dA);
    const b = toPaperItem(null, dB);
    if (!a || !b) return null;
    let result;
    try {
      if (op === 'unite') result = a.unite(b);
      else if (op === 'subtract') result = a.subtract(b);
      else result = a.intersect(b);
    } catch (e) {
      sc.project.clear();
      return null;
    }
    if (!result) { sc.project.clear(); return null; }
    const subs = fromPaperItem(result);
    sc.project.clear();
    return subs.length ? subs : null;
  };

  App.BOOLEAN_OP_NAMES = { unite: '并集', subtract: '差集', intersect: '交集' };
})();
