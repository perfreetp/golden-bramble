import './styles/tokens.css';
import { store } from './core/store.js';
import { buildSeedBundle } from './core/seed.js';

// 叶子组件必须先于组合它们的屏幕组件定义，
// 否则屏幕组件 connectedCallback 运行时子元素尚未升级（HTMLUnknownElement）。
import { EditorViewport } from './components/editor-viewport.js';
import { PanelHierarchy } from './components/panel-hierarchy.js';
import { PanelTimeline } from './components/panel-timeline.js';
import { PanelCurve } from './components/panel-curve.js';
import { ScreenTaskHall } from './components/screen-task-hall.js';
import { ScreenAnimEditor } from './components/screen-anim-editor.js';
import { ScreenGradeReview } from './components/screen-grade-review.js';
import { ScreenClassDashboard } from './components/screen-class-dashboard.js';
import { AppShell } from './components/app-shell.js';

// 首次进入或本地存储被清空时播种演示数据（不能只看内存字段，模块可能被浏览器缓存复用）
const hasStoredSeed = localStorage.getItem('rdap.v1.tasks') || localStorage.getItem('rdap.v1.klasses');
if (!hasStoredSeed) {
  store.reseed(buildSeedBundle());
}

export function defineAll(): void {
  const defs: Array<[string, CustomElementConstructor]> = [
    ['editor-viewport', EditorViewport],
    ['panel-hierarchy', PanelHierarchy],
    ['panel-timeline', PanelTimeline],
    ['panel-curve', PanelCurve],
    ['screen-task-hall', ScreenTaskHall],
    ['screen-anim-editor', ScreenAnimEditor],
    ['screen-grade-review', ScreenGradeReview],
    ['screen-class-dashboard', ScreenClassDashboard],
    ['app-shell', AppShell],
  ];
  for (const [name, ctor] of defs) {
    if (!customElements.get(name)) customElements.define(name, ctor);
  }
}

defineAll();
