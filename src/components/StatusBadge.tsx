// 工单状态徽章
import type { OrderStatus } from '../types';

const MAP: Record<OrderStatus, { text: string; cls: string }> = {
  received: { text: '待分派', cls: 'st-received' },
  assigned: { text: '设计中', cls: 'st-assigned' },
  submitted: { text: '待质检', cls: 'st-submitted' },
  passed: { text: '已通过', cls: 'st-passed' },
  rework: { text: '返工中', cls: 'st-rework' },
};

export default function StatusBadge(props: { status: OrderStatus }) {
  // 必须通过 getter 访问 props，组件体里的普通常量只会求值一次，无法响应状态流转
  return (
    <span class={`status-badge ${MAP[props.status].cls}`}>{MAP[props.status].text}</span>
  );
}
