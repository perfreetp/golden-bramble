/** 领域模型与参数类型 */

export type WeaveRule = 'plain' | 'twill' | 'hex';

export const RULE_LABELS: Record<WeaveRule, string> = {
  plain: '经纬编织（平纹）',
  twill: '斜纹',
  hex: '六角网',
};

/** 色带：一种颜色的带材及其占比 */
export interface ColorBand {
  id: string;
  name: string;
  color: string; // #rrggbb
  ratio: number; // 占比权重（决定该色带材出现的宽窄/频率）
}

export interface PatternParams {
  rule: WeaveRule;
  seed: number;
  /** 经密：根 / 10cm */
  warpDensity: number;
  /** 纬密：根 / 10cm */
  weftDensity: number;
  /** 带材宽度 mm */
  stripWidth: number;
  /** 幅面实际尺寸 mm */
  widthMm: number;
  heightMm: number;
  /** 斜纹飞数（仅斜纹规则使用） */
  twillStep: number;
  bands: ColorBand[];
}

/** 单个编织单元的压叠方向 */
export const TOP_WARP = 0; // 经压纬（经在上）
export const TOP_WEFT = 1; // 纬压经（纬在上）
export const HOLE = 2; // 六角网孔洞

/** 生成后的整幅网格 */
export interface WeaveGrid {
  warpCount: number;
  weftCount: number;
  pitchX: number; // mm / 经向节距
  pitchY: number; // mm / 纬向节距
  top: Uint8Array; // warpCount*weftCount，TOP_WARP/TOP_WEFT/HOLE
  warpBand: Int32Array; // 每根经带的色带下标
  weftBand: Int32Array;
  warpShade: Float32Array; // 每根带的明暗系数 0.85~1.1
  weftShade: Float32Array;
}

/** 手工修改：重新生成时保留，并标记为手工项 */
export interface ManualEdit {
  kind: 'flip' | 'warpColor' | 'weftColor';
  i: number; // 经向序号（flip 时为单元坐标）
  j: number; // 纬向序号（改色时不用，置 -1）
  value: number; // flip: TOP_*；颜色: 色带下标
}

/** 锁定区域（单元坐标，含端点）：重掷时该区域内保持不变 */
export interface LockRegion {
  i0: number;
  j0: number;
  i1: number;
  j1: number;
}

export interface PatternState {
  params: PatternParams;
  grid: WeaveGrid;
  manual: ManualEdit[];
  locks: LockRegion[];
}

export function defaultBands(): ColorBand[] {
  return [
    { id: 'b1', name: '藤黄', color: '#c8a24b', ratio: 5 },
    { id: 'b2', name: '深咖', color: '#6b4a2b', ratio: 3 },
    { id: 'b3', name: '米白', color: '#e8dfc8', ratio: 2 },
  ];
}

export function defaultParams(): PatternParams {
  return {
    rule: 'plain',
    seed: 20261119,
    warpDensity: 25,
    weftDensity: 25,
    stripWidth: 3.2,
    widthMm: 900,
    heightMm: 600,
    twillStep: 1,
    bands: defaultBands(),
  };
}

export function cellIndex(grid: WeaveGrid, i: number, j: number): number {
  return j * grid.warpCount + i;
}

/** 参数指纹：参与种子派生，保证“同种子+同参数=同结果” */
export function paramsFingerprint(p: PatternParams): string {
  return [
    p.rule,
    p.seed,
    p.warpDensity,
    p.weftDensity,
    p.stripWidth,
    p.widthMm,
    p.heightMm,
    p.twillStep,
    p.bands.map((b) => `${b.color}:${b.ratio}`).join(','),
  ].join('|');
}
