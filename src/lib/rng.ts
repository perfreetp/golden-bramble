/**
 * mulberry32 —— 确定性伪随机数生成器。
 * 同一种子产生完全一致的浮点序列；所有布局与高度均由该序列派生，
 * 因此同种子 + 同障碍序列 => 同布局、同高度。
 */
export class Rng {
  private state: number;

  constructor(seed: number) {
    // 保证 32 位无符号
    this.state = seed >>> 0;
  }

  /** [0, 1) 浮点 */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** [min, max] 闭区间浮点 */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** [min, max] 闭区间整数 */
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /** 按难度系数在 [easy, hard] 间取值：d=0 取 easy，d=1 取 hard */
  scaled(easy: number, hard: number, difficulty: number): number {
    return easy + (hard - easy) * difficulty;
  }

  /** 取数组中的随机元素 */
  pick<T>(arr: T[]): T {
    return arr[this.int(0, arr.length - 1)];
  }
}

/** 字符串种子哈希为 32 位整数（数字种子原样使用） */
export function hashSeed(input: string | number): number {
  if (typeof input === 'number') return input >>> 0;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
