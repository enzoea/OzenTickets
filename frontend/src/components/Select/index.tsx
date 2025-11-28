import { selectStyle } from "./style";
import type { SelectProps } from "./interface";

export default function Select({ value, onChange, options, children, style = {}, placeholder, disabled = false }: SelectProps) {
  const mergedStyle = { ...selectStyle(disabled), ...style } as React.CSSProperties;
  return (
    <select value={value} onChange={disabled ? undefined : (e) => onChange(e.target.value)} style={mergedStyle} disabled={disabled}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options
        ? options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        : children}
    </select>
  );
}
