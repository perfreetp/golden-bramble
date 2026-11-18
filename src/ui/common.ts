/** UI 公共工具 */

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) node.append(c);
  return node;
}

export function download(filename: string, content: string | Blob, mime = 'text/plain'): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export const PANEL_CSS = `
  :host { display: block; font-size: 13px; }
  h3 { margin: 0 0 8px; font-size: 13px; color: #d8c98f; letter-spacing: 1px; }
  .row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; flex-wrap: wrap; }
  label { color: #a9a294; min-width: 52px; }
  input, select { background: #2b2f36; color: #e6e2d8; border: 1px solid #454a52; border-radius: 4px;
    padding: 3px 6px; font-size: 12px; max-width: 110px; }
  input[type=color] { padding: 0; width: 34px; height: 24px; }
  button { background: #3a4048; color: #e6e2d8; border: 1px solid #555b64; border-radius: 4px;
    padding: 4px 10px; font-size: 12px; cursor: pointer; }
  button:hover { background: #4a515b; }
  button.primary { background: #6b5a2e; border-color: #8a743c; }
  button.primary:hover { background: #7d6a38; }
  button.danger { background: #5a3030; border-color: #7a4040; }
  button.active { outline: 2px solid #d8c98f; }
  button:disabled { opacity: 0.45; cursor: not-allowed; }
  table { border-collapse: collapse; width: 100%; font-size: 12px; }
  th, td { border: 1px solid #3c4148; padding: 3px 6px; text-align: left; }
  th { color: #d8c98f; background: #2b2f36; }
  .hint { color: #8b8578; font-size: 11px; line-height: 1.5; }
  .swatch { display: inline-block; width: 12px; height: 12px; border-radius: 2px; vertical-align: -2px; margin-right: 4px; }
`;
