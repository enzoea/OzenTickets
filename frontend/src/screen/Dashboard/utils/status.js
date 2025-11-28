export const colorForStatus = (status, mode, theme) => {
  if (mode === "pie") return theme.chart.statusColorsPie[status] || theme.palettes.blue[0];
  return theme.chart.statusColorsBar[status] || theme.palettes.blue[0];
};

