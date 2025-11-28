import { overlayStyle, contentStyle, titleStyle, bodyStyle } from "./style";
import type { ModalProps } from "./interface";

export default function Modal({ open, title, children, onClose, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={titleStyle}>{title}</div>
        <div className="modal-scroll" style={bodyStyle}>{children}</div>
        {footer}
      </div>
    </div>
  );
}

