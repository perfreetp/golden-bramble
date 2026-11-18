/** 应用外壳：左参数/色带，中画布，右拼片与订单 */

import './canvas-view';
import './param-panel';
import './band-editor';
import './tile-panel';
import './project-panel';

export class AppShell extends HTMLElement {
  connectedCallback(): void {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { display: grid; height: 100vh;
          grid-template-columns: 300px 1fr 340px;
          grid-template-rows: 44px 1fr;
          grid-template-areas: "header header header" "left canvas right"; }
        header { grid-area: header; display: flex; align-items: center; gap: 10px;
          padding: 0 14px; background: #26292f; border-bottom: 1px solid #3c4148; }
        header b { color: #d8c98f; font-size: 15px; letter-spacing: 1px; }
        header span { color: #8b8578; font-size: 12px; }
        aside { overflow-y: auto; padding: 10px; background: #23262b; }
        aside.left { grid-area: left; border-right: 1px solid #3c4148; }
        aside.right { grid-area: right; border-left: 1px solid #3c4148; }
        main { grid-area: canvas; position: relative; min-width: 0; min-height: 0; }
        .sep { border: none; border-top: 1px solid #3c4148; margin: 12px 0; }
        @media (max-width: 1100px) {
          :host { grid-template-columns: 260px 1fr; grid-template-areas: "header header" "left canvas"; }
          aside.right { display: none; }
        }
      </style>
      <header>
        <b>藤编纹样工作室</b>
        <span>仿藤塑料户外家具 · 编织纹样过程式生成 · 经纬编织 / 斜纹 / 六角网</span>
      </header>
      <aside class="left">
        <param-panel></param-panel>
        <hr class="sep">
        <band-editor></band-editor>
      </aside>
      <main><canvas-view></canvas-view></main>
      <aside class="right">
        <tile-panel></tile-panel>
        <hr class="sep">
        <project-panel></project-panel>
      </aside>
    `;
  }
}

customElements.define('app-shell', AppShell);
