/** 拼片清单面板：拼缝位置、分色带材用量，导出 CSV / JSON / 预览 PNG */

import { tilePlanToCsv, tilePlanToJson } from '../core/tiling';
import { store } from '../state/store';
import { PANEL_CSS, download } from './common';
import { canvasView, currentRenderInput } from './canvas-view';

export class TilePanel extends HTMLElement {
  private unsub?: () => void;

  connectedCallback(): void {
    this.attachShadow({ mode: 'open' });
    this.unsub = store.subscribe(() => this.render());
    this.render();
  }

  disconnectedCallback(): void {
    this.unsub?.();
  }

  private render(): void {
    const s = store.state;
    const shadow = this.shadowRoot!;
    const input = currentRenderInput();
    const plan = input.plan!;

    shadow.innerHTML = `
      <style>${PANEL_CSS}
        .scroll { max-height: 260px; overflow: auto; }
        .total { margin-top: 6px; }
      </style>
      <h3>拼片清单（${plan.cols} × ${plan.rows} 共 ${plan.tiles.length} 片，边长 ${plan.tileSizeMm}mm）</h3>
      <div class="row">
        <button id="csv" class="primary">导出清单 CSV</button>
        <button id="json">导出 JSON</button>
        <button id="png">导出预览图 PNG</button>
      </div>
      <div class="scroll"><table>
        <tr><th>#</th><th>位置(mm)</th><th>尺寸(mm)</th><th>拼缝(mm)</th><th>带材用量</th></tr>
        ${plan.tiles
          .map(
            (t) => `<tr>
              <td>${t.index}</td>
              <td>${t.x}, ${t.y}</td>
              <td>${t.w} × ${t.h}</td>
              <td>${[
                t.seams.vertical !== undefined ? `纵 ${t.seams.vertical}` : '',
                t.seams.horizontal !== undefined ? `横 ${t.seams.horizontal}` : '',
              ]
                .filter(Boolean)
                .join('；') || '—'}</td>
              <td>${t.usage
                .map(
                  (u) =>
                    `<span class="swatch" style="background:${u.color}"></span>${u.bandName} ${u.meters}m`,
                )
                .join('<br>')}</td>
            </tr>`,
          )
          .join('')}
      </table></div>
      <div class="total"><b>合计用量：</b>${plan.totalUsage
        .map(
          (u) =>
            `<span class="swatch" style="background:${u.color}"></span>${u.bandName} ${u.meters}m`,
        )
        .join('　')}</div>
    `;

    (shadow.querySelector('#csv') as HTMLButtonElement).addEventListener('click', () =>
      download(`拼片清单_${s.params.rule}_seed${s.params.seed}.csv`, tilePlanToCsv(plan), 'text/csv'),
    );
    (shadow.querySelector('#json') as HTMLButtonElement).addEventListener('click', () =>
      download(`拼片清单_${s.params.rule}_seed${s.params.seed}.json`, tilePlanToJson(plan), 'application/json'),
    );
    (shadow.querySelector('#png') as HTMLButtonElement).addEventListener('click', async () => {
      const blob = await canvasView?.exportPng();
      if (blob) download(`纹样预览_${s.params.rule}_seed${s.params.seed}.png`, blob, 'image/png');
    });
  }
}

customElements.define('tile-panel', TilePanel);
