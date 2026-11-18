import './app';
import { store } from './store';

// 控制台/自动化测试钩子（不影响生产逻辑）
declare global {
  interface Window { __store: typeof store }
}
window.__store = store;
