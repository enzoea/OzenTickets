import { theme } from "../../theme";

export const containerStyle: React.CSSProperties = {
  position: "relative",
  display: "inline-block",
};

export const pickerButtonStyle = (disabled: boolean): React.CSSProperties => ({
  padding: "8px 10px",
  borderRadius: theme.radius.sm,
  border: `1px solid ${theme.colors.border}`,
  background: disabled ? theme.colors.gray : theme.colors.white,
  color: disabled ? "#9CA3AF" : theme.colors.text,
  cursor: disabled ? "not-allowed" : "pointer",
  minWidth: 180,
  textAlign: "left",
});

export const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  left: 0,
  zIndex: 1000,
  marginTop: 4,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.sm,
  background: theme.colors.white,
  boxShadow: theme.shadow.sm,
  overflow: "hidden",
  minWidth: 300,
  maxHeight: "70vh",
};
