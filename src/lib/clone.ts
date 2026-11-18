// 纯数据深拷贝：文档模型全是 JSON 安全数据；不能用 structuredClone 克隆 Solid 代理
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
