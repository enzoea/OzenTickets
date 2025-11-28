import { primaryButtonStyle } from "./style";
import type { PrimaryButtonProps } from "./interface";

export default function PrimaryButton({ children, disabled = false, onClick, style = {}, type = "button", form }: PrimaryButtonProps) {
  const mergedStyle = { ...primaryButtonStyle(!!disabled), ...style } as React.CSSProperties;
  return (
    <button type={type} form={form} disabled={disabled} onClick={onClick} style={mergedStyle}>
      {children}
    </button>
  );
}

