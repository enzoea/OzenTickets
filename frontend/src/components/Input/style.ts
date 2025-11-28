import { theme } from "../../theme";

export const baseInputStyle: React.CSSProperties = {
  width: "100%",
  padding: theme.spacing.sm,
  borderRadius: theme.radius.sm,
  border: `1px solid ${theme.colors.border}`,
  fontSize: theme.typography.baseSize,
  background: theme.colors.white,
  color: theme.colors.text,
};

export const disabledInputStyle: React.CSSProperties = {
  background: theme.colors.gray,
  color: "#9CA3AF",
  cursor: "not-allowed",
};
