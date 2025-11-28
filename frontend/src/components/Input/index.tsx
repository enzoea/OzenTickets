import { baseInputStyle, disabledInputStyle } from "./style";
import type { InputProps } from "./interface";

export default function Input({ value, onChange, onBlur, placeholder, type = "text", style = {}, multiline = false, disabled = false }: InputProps) {
  const mergedStyle = { ...(disabled ? { ...baseInputStyle, ...disabledInputStyle } : baseInputStyle), ...style } as React.CSSProperties;

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={disabled ? undefined : (e) => onChange(e.target.value)}
        onBlur={disabled ? undefined : onBlur}
        style={{
          ...mergedStyle,
          minHeight: 60,
          overflowWrap: "break-word",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={disabled ? undefined : (e) => onChange(e.target.value)}
      onBlur={disabled ? undefined : onBlur}
      style={mergedStyle}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}
