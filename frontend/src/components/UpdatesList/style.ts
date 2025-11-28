import { theme } from "../../theme";

export const listWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  maxHeight: 260,
  overflowY: "auto",
  borderTop: `1px solid ${theme.colors.border}`,
  paddingTop: 8,
};

export const listItemStyle: React.CSSProperties = {
  background: theme.colors.gray,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius.sm,
  padding: 8,
};

export const listHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 12,
  marginBottom: 4,
};

export const actionRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  justifyContent: "flex-end",
  marginTop: 6,
};

export const plainButtonStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: theme.radius.sm,
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.white,
  color: theme.colors.text,
  cursor: "pointer",
};

export const dangerButtonStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: theme.radius.sm,
  border: `1px solid ${theme.colors.border}`,
  background: theme.colors.white,
  color: theme.colors.danger,
  cursor: "pointer",
};

