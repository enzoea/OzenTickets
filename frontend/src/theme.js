export const theme = {
  colors: {
    primary: "#2C4156",
    white: "#ffffff",
    text: "#1F2937",
    border: "#e5e7eb",
    gray: "#f7f9fb",
    blueOutline: "#2C4156",
    danger: "#ef5350",
  },
  palettes: {
    blue: [
      "#2C4156",
      "#3A4E66",
      "#4B6B89",
      "#5B7EA3",
      "#8FB1D9",
      "#C7D6E6",
      "#E8EFF6",
    ],
  },
  chart: {
    statusColorsBar: {
      backlog: "#2C4156",
      a_fazer: "#3A4E66",
      fazendo: "#4B6B89",
      pronto: "#5B7EA3",
      para_teste: "#8FB1D9",
      em_teste: "#C7D6E6",
      finalizado: "#E8EFF6",
    },
    statusColorsPie: {
      backlog: "#2C4156",
      a_fazer: "#3A4E66",
      fazendo: "#4B6B89",
      pronto: "#ffffff",
      para_teste: "#8FB1D9",
      em_teste: "#C7D6E6",
      finalizado: "#E8EFF6",
    },
  },
  typography: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    baseSize: 14,
    h1: 24,
    h2: 18,
    h3: 16,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  radius: {
    sm: 4,
    md: 6,
    lg: 8,
  },
  layout: {
    sidebarWidth: 240,
    modalPaddingX: 12,
  },
  shadow: {
    sm: "0 1px 2px rgba(0,0,0,0.06)",
    md: "0 6px 12px rgba(0,0,0,0.08)",
  },
  transition: {
    fast: "150ms ease",
  },
};
