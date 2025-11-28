import { theme } from "../../theme";

export const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  backdropFilter: "blur(1px)",
};

export const contentStyle: React.CSSProperties = {
  width: 900,
  maxWidth: "95vw",
  maxHeight: "90vh",
  background: theme.colors.white,
  borderRadius: theme.radius.lg,
  boxShadow: theme.shadow.md,
  padding: theme.spacing.lg,
  transition: `transform ${theme.transition.fast}, opacity ${theme.transition.fast}`,
  display: "flex",
  flexDirection: "column",
};

export const titleStyle: React.CSSProperties = {
  fontSize: theme.typography.h2,
  fontWeight: 700,
  marginBottom: theme.spacing.md,
  paddingLeft: theme.layout.modalPaddingX,
  paddingRight: theme.layout.modalPaddingX,
};

export const bodyStyle: React.CSSProperties = {
  paddingLeft: theme.layout.modalPaddingX,
  paddingRight: theme.layout.modalPaddingX,
  overflowY: "auto",
};

