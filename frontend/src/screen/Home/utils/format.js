export const formatDate = (s) => {
  if (!s) return "Sem previsão";
  try {
    const str = String(s);
    const d = /^\d{4}-\d{2}-\d{2}$/.test(str) ? new Date(`${str}T00:00:00`) : new Date(str);
    return d.toLocaleDateString("pt-BR");
  } catch {
    return String(s);
  }
};

export const isToday = (s) => {
  if (!s) return false;
  try {
    const str = String(s);
    const d = /^\d{4}-\d{2}-\d{2}$/.test(str) ? new Date(`${str}T00:00:00`) : new Date(str);
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    const now = new Date();
    return y === now.getFullYear() && m === now.getMonth() && day === now.getDate();
  } catch {
    return false;
  }
};
