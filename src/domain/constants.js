// 领域常量：分区、瓦件规格表、设色等级釉色板、布局常量
// 全部尺寸单位：毫米 (mm)

// 分区定义
export const ZONES = {
  dougong: { code: 'DG', name: '檐下斗拱层', motif: 'dougong', prefix: 'DG' },
  frame: { code: 'BK', name: '边框', motif: 'huiwen', prefix: 'BK' },
  fangxin: { code: 'FX', name: '枋心花板', motif: 'huaban', prefix: 'FX' },
  chajiao: { code: 'CJ', name: '岔角', motif: 'jucao', prefix: 'CJ' },
  qunban: { code: 'QB', name: '裙板', motif: 'qunban', prefix: 'QB' },
  trim: { code: 'SB', name: '收边件', motif: 'trim', prefix: 'SB' },
};

export const ZONE_ORDER = ['dougong', 'frame', 'fangxin', 'chajiao', 'qunban', 'trim'];

// 厂里的瓦件规格表（标准件公称尺寸；不在表内的实际余量一律落收边件）
export const TILE_SPECS = {
  dougong: { label: '斗拱件', widths: [320, 260], heights: [200, 160] },
  frame: { label: '边框件', widths: [400, 300], heights: [150] },
  fangxin: { label: '枋心花板', widths: [600, 480], heights: [400, 320] },
  chajiao: { label: '岔角件', legs: [300, 240, 180] }, // 直角三角件的直边规格
  qunban: { label: '裙板件', widths: [500, 360], heights: [260, 200] },
};

// 布局常量
export const LAYOUT = {
  FRAME_T: 150, // 边框料厚
  SKIRT_RATIO: 0.22, // 裙板占框内净高比例
  GROUT: 6, // 瓦件间勾缝（示意图上的缝）
  BAY_GAP: 12, // 开间之间的壁柱影缝
};

// 设色等级（琉璃釉色），piece 可单独改色覆盖整单等级
export const COLOR_GRADES = {
  1: {
    label: '一等·黄琉璃',
    main: '#e8b73c', secondary: '#c98a1e', accent: '#8f5f10',
    line: '#5e3d08', ground: '#f6dd9a',
  },
  2: {
    label: '二等·绿琉璃',
    main: '#3f8f4e', secondary: '#2c6b38', accent: '#1d4a26',
    line: '#123018', ground: '#bfe0c4',
  },
  3: {
    label: '三等·孔雀蓝',
    main: '#2f7fa6', secondary: '#215e7d', accent: '#154057',
    line: '#0d2a3a', ground: '#b9dcec',
  },
  4: {
    label: '四等·青灰剪边',
    main: '#667780', secondary: '#4c5b63', accent: '#344047',
    line: '#222b30', ground: '#d3d9dc',
  },
  5: {
    label: '五等·五彩琉璃',
    main: '#c0453b', secondary: '#2f7fa6', accent: '#e8b73c',
    line: '#3a2a28', ground: '#f0e2c8',
  },
};

export const MOTIF_LABELS = {
  jucao: '岔角卷草',
  huaban: '枋心花板',
  dougong: '斗拱几何',
  huiwen: '回纹边框',
  qunban: '裙板如意',
  trim: '素面收边',
};

// 每个分区允许师傅换的纹样族
export const ZONE_MOTIFS = {
  dougong: ['dougong'],
  frame: ['huiwen'],
  fangxin: ['huaban'],
  chajiao: ['jucao'],
  qunban: ['qunban'],
  trim: ['trim'],
};

// 纹样可调参数定义（滑块）
export const MOTIF_PARAMS = {
  jucao: [
    { key: 'density', label: '卷草密度', min: 1, max: 5, step: 1 },
    { key: 'curl', label: '卷曲度', min: 0.5, max: 2, step: 0.1 },
    { key: 'leafScale', label: '叶片大小', min: 0.5, max: 1.6, step: 0.1 },
    { key: 'symmetry', label: '镜像对称', min: 0, max: 1, step: 1 },
  ],
  huaban: [
    { key: 'petals', label: '花瓣数', min: 4, max: 12, step: 1 },
    { key: 'layers', label: '叠层数', min: 1, max: 3, step: 1 },
    { key: 'twist', label: '扭转度', min: 0, max: 1.5, step: 0.1 },
    { key: 'density', label: '点缀密度', min: 0, max: 4, step: 1 },
  ],
  dougong: [
    { key: 'density', label: '攒当密度', min: 1, max: 4, step: 1 },
    { key: 'layers', label: '出跳层数', min: 1, max: 3, step: 1 },
  ],
  huiwen: [
    { key: 'density', label: '回纹密度', min: 1, max: 4, step: 1 },
  ],
  qunban: [
    { key: 'density', label: '如意密度', min: 1, max: 4, step: 1 },
    { key: 'leafScale', label: '云头大小', min: 0.6, max: 1.5, step: 0.1 },
  ],
  trim: [
    { key: 'density', label: '线道密度', min: 1, max: 3, step: 1 },
  ],
};

export const ORDER_STATUS = {
  assigned: '已分派',
  in_progress: '制作中',
  submitted: '质检中',
  returned: '打回返工',
  passed: '质检通过',
};
