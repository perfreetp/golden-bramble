/** Web Components 共享小工具 */

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, unknown> = {},
  children: Array<Node | string> = [],
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === 'class') el.className = String(value);
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
    } else if (value !== null && value !== undefined) {
      (el as unknown as Record<string, unknown>)[key] = value;
    }
  }
  for (const child of children) {
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

export function clear(node: Node): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/** 组件内常用按钮样式片段 */
export const SHARED_CSS = /* css */ `
  :host {
    --bg: var(--bg, #0f1420);
    --bg-panel: #171e2e;
    --bg-panel-2: #1e2740;
    --bg-input: #0c111d;
    --border: #2a3550;
    --border-strong: #3d4d72;
    --fg: #e6ecf7;
    --fg-dim: #93a1bd;
    --fg-faint: #64718c;
    --accent: #4f8cff;
    --accent-soft: rgba(79, 140, 255, 0.18);
    --good: #35c98f;
    --warn: #f5a623;
    --bad: #ff5d6c;
    --purple: #a78bfa;
    --radius: 8px;
    --radius-sm: 5px;
    font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
    color: var(--fg);
  }
  button {
    background: var(--bg-panel-2);
    color: var(--fg);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;
    transition: background .15s, border-color .15s;
  }
  button:hover { border-color: var(--accent); }
  button.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
    font-weight: 600;
  }
  button.primary:hover { filter: brightness(1.1); }
  button.ghost { background: transparent; }
  button.danger { border-color: var(--bad); color: var(--bad); }
  button:disabled { opacity: .45; cursor: not-allowed; }
  input, select, textarea {
    background: var(--bg-input);
    color: var(--fg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 6px 8px;
    font-size: 13px;
    font-family: inherit;
    outline: none;
  }
  input:focus, select:focus, textarea:focus { border-color: var(--accent); }
  input[type="range"] { padding: 0; }
  label { font-size: 12px; color: var(--fg-dim); }
  .card {
    background: var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
  }
  .tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    border: 1px solid var(--border-strong);
    color: var(--fg-dim);
  }
  .tag.good { color: var(--good); border-color: var(--good); }
  .tag.warn { color: var(--warn); border-color: var(--warn); }
  .tag.bad { color: var(--bad); border-color: var(--bad); }
  .scroll { overflow: auto; }
  ::-webkit-scrollbar { width: 9px; height: 9px; }
  ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 6px; }
`;

export interface ToastMsg {
  text: string;
  kind: 'info' | 'warn' | 'bad' | 'good';
}

export function toast(text: string, kind: ToastMsg['kind'] = 'info'): void {
  window.dispatchEvent(new CustomEvent<ToastMsg>('app-toast', { detail: { text, kind } }));
}
