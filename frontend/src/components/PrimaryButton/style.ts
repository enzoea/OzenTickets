import { theme } from "../../theme";

export const primaryButtonStyle = (disabled: boolean): React.CSSProperties => ({
  marginTop: theme.spacing.sm,
  padding: "8px 12px",
  borderRadius: theme.radius.sm,
  border: "none",
  background: disabled ? "#999" : theme.colors.primary,
  color: theme.colors.white,
  cursor: disabled ? "default" : "pointer",
  fontWeight: 600,
});

