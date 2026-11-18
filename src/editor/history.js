// 撤销/重做栈：快照式，仅记录文档内容，不记录层序面板状态
const CAP = 60

// Pinia 深度代理无法 structuredClone，统一用 JSON 往返得到纯对象（文档数据均可 JSON 序列化）
const clone = (v) => JSON.parse(JSON.stringify(v))

export class History {
  constructor() {
    this.undoStack = []
    this.redoStack = []
    this.label = ''
  }

  // 在修改前调用：把当前文档压栈
  push(snapshot, label = '编辑') {
    this.undoStack.push({ state: clone(snapshot), label })
    if (this.undoStack.length > CAP) this.undoStack.shift()
    this.redoStack = []
  }

  undo(current) {
    const entry = this.undoStack.pop()
    if (!entry) return null
    this.redoStack.push({ state: clone(current), label: entry.label })
    return entry
  }

  redo(current) {
    const entry = this.redoStack.pop()
    if (!entry) return null
    this.undoStack.push({ state: clone(current), label: entry.label })
    return entry
  }

  get canUndo() { return this.undoStack.length > 0 }
  get canRedo() { return this.redoStack.length > 0 }
  get nextUndoLabel() { return this.undoStack.at(-1)?.label || '' }
  get nextRedoLabel() { return this.redoStack.at(-1)?.label || '' }

  clear() {
    this.undoStack = []
    this.redoStack = []
  }
}
