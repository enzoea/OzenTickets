export interface InputProps {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
  disabled?: boolean;
}

