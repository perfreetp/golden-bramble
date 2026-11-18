// 通用模态框
import type { JSX } from 'solid-js';

interface Props {
  title: string;
  onClose: () => void;
  children: JSX.Element;
  footer?: JSX.Element;
  width?: number;
}

export default function Modal(props: Props) {
  return (
    <div class="modal-mask" onPointerDown={(e) => e.target === e.currentTarget && props.onClose()}>
      <div class="modal" style={props.width ? { width: `${props.width}px` } : undefined}>
        <h3>{props.title}</h3>
        {props.children}
        {props.footer && <div class="modal-actions">{props.footer}</div>}
      </div>
    </div>
  );
}
