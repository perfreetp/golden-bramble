// 确定性随机：字符串哈希 + mulberry32。
// 生成链路严禁使用 Math.random / Date.now，保证同种子同参数结果逐位一致。

export function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // 再做一次雪崩混合，避免相邻字符串图案雷同
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 基于若干字符串/数字拼一个稳定种子
export function seedFrom(...parts) {
  return hashString(parts.map((p) => String(p)).join('|'));
}

let mutatingSeedCounter = 0;
// 仅用于"换种子"这类用户主动动作（动作本身会被持久化，不破坏复现性）
export function nextManualSeed(baseKey) {
  mutatingSeedSeedCounterGuard();
  mutatingSeedCounter += 1;
  return seedFrom('manual', baseKey, mutatingSeedCounter);
}
function mutatingSeedSeedCounterGuard() {
  // 占位：计数器在会话内单调，结果随用户动作落库，重生成时从库里读回即可复现
}
