// 玩具厂标准色卡（宠物咬胶专用）
export const PALETTE = [
  { name: '珊瑚红', hex: '#e8553f' },
  { name: '奶油黄', hex: '#f2c94c' },
  { name: '薄荷绿', hex: '#5fc98e' },
  { name: '天空蓝', hex: '#4f9fd8' },
  { name: '薰衣紫', hex: '#9b7ed9' },
  { name: '蜜桃粉', hex: '#f2a0b5' },
  { name: '咖啡棕', hex: '#8a5a3b' },
  { name: '牛奶白', hex: '#f2efe8' },
  { name: '炭黑',   hex: '#3a3a3f' },
  { name: '荧光橙', hex: '#ff8c2e' },
];

export function paletteName(i) {
  return PALETTE[i] ? PALETTE[i].name : '色' + i;
}
