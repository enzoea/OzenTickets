import { theme } from "../../theme";

export const selectStyle = (disabled: boolean): React.CSSProperties => ({
  width: "100%",
  padding: theme.spacing.sm,
  borderRadius: theme.radius.sm,
  border: `1px solid ${theme.colors.border}`,
  fontSize: theme.typography.baseSize,
  color: disabled ? "#9CA3AF" : theme.colors.text,
  background: disabled ? theme.colors.gray : theme.colors.white,
  cursor: disabled ? "not-allowed" : "pointer",
});
