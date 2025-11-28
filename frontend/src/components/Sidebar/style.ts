import { theme } from "../../theme";

export const asideStyle: React.CSSProperties = {
  width: theme.layout.sidebarWidth,
  position: "fixed",
  top: 0,
  left: 0,
  height: "100vh",
  zIndex: 100,
  background: theme.palettes.blue[6],
  color: theme.colors.text,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  overflowY: "auto",
  borderRight: `1px solid ${theme.palettes.blue[5]}`,
};

export const navButtonStyle = (active: boolean): React.CSSProperties => ({
  background: "transparent",
  color: theme.colors.text,
  border: `1px solid ${active ? theme.colors.blueOutline : theme.palettes.blue[5]}`,
  textAlign: "left",
  cursor: "pointer",
  fontSize: theme.typography.baseSize,
  padding: "8px 12px",
  borderRadius: theme.radius.md,
});

export const logoutButtonStyle: React.CSSProperties = {
  marginTop: 8,
  width: "100%",
  padding: "6px 10px",
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.palettes.blue[5]}`,
  background: "transparent",
  color: theme.colors.text,
  cursor: "pointer",
  fontSize: 14,
};
