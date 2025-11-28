export interface SelectOption { value: string; label: string }

export interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options?: SelectOption[];
  children?: React.ReactNode;
  style?: React.CSSProperties;
  placeholder?: string;
  disabled?: boolean;
}
