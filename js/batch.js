/* ============================================================
 * batch.js — 素材批次：自动检查分级 + 复核放行流程
 * 三级规则（阈值可在界面调整）：
 *   合格 pass ：线宽 ≥ 阈值 且 断点数 ≤ 阈值
 *   警告 warn ：任一指标超出阈值但在 20% 容差内
 *   退回 reject：超容差，或线宽低于 0.3mm 激光物理极限
 * 整批全部复核完（无 pending）才允许放行；退回项必须填原因。
 * ============================================================ */
(function () {
  const App = window.App;

  App.defaultBatch = function () {
    return {
      name: 'B' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-笔杆纹样批次',
      thresholds: { minLineWidthMm: 1.0, maxBreaks: 2 },
      items: []
    };
  };

  App.classify = function (item, th) {
    const hardLimit = App.GAP_LIMIT_MM;
    const lw = item.minLineWidthMm, br = item.breaks;
    const lwWarn = th.minLineWidthMm * 0.8;
    const brWarn = th.maxBreaks + Math.max(1, Math.ceil(th.maxBreaks * 0.2));
    if (lw < hardLimit) return 'reject';
    if (lw < th.minLineWidthMm || br > th.maxBreaks) {
      if (lw >= lwWarn && br <= brWarn) return 'warn';
      return 'reject';
    }
    return 'pass';
  };

  App.runAutoCheck = function (batch) {
    batch.items.forEach(it => {
      it.tier = App.classify(it, batch.thresholds);
    });
    return batch;
  };

  // 确定性伪随机，保证示例批次每次一致
  function seeded(seed) {
    let s = seed;
    return () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }

  App.sampleBatch = function () {
    const rnd = seeded(20261119);
    const suppliers = ['徽州竹艺社', '善琏供应商A', '泾县木雕坊', '东阳激光来料'];
    const presets = [
      // 合格区
      { lw: 1.22, br: 0, gaps: 0 }, { lw: 1.08, br: 1, gaps: 0 },
      { lw: 1.35, br: 2, gaps: 0 }, { lw: 1.01, br: 0, gaps: 0 },
      // 警告区（20% 容差内）
      { lw: 0.92, br: 2, gaps: 0 }, { lw: 0.85, br: 3, gaps: 1 },
      { lw: 1.05, br: 3, gaps: 0 },
      // 退回区
      { lw: 0.22, br: 5, gaps: 4 }, { lw: 0.28, br: 6, gaps: 6 },
      { lw: 0.61, br: 7, gaps: 2 }, { lw: 0.45, br: 4, gaps: 3 },
      { lw: 0.95, br: 9, gaps: 1 }
    ];
    const batch = App.defaultBatch();
    batch.items = presets.map((pr, i) => {
      const jitter = (rnd() - 0.5) * 0.04;
      const item = {
        id: 'MT-' + String(1001 + i),
        supplier: suppliers[i % suppliers.length],
        minLineWidthMm: App.round3(Math.max(0.1, pr.lw + jitter)),
        breaks: pr.br,
        narrowGaps: pr.gaps,
        decision: 'pending',        // pending | approved | rejected
        reason: '',
        reasonDraft: '',
        showReason: false,
        reviewer: '',
        decidedAt: null
      };
      item.tier = App.classify(item, batch.thresholds);
      return item;
    });
    return batch;
  };

  App.downloadJSON = function (filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    triggerDownload(blob, filename);
  };

  App.downloadText = function (filename, text, mime) {
    triggerDownload(new Blob([text], { type: mime || 'text/plain;charset=utf-8' }), filename);
  };

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 400);
  }
})();
