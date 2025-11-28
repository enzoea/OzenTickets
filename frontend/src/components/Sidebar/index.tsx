import { asideStyle, navButtonStyle, logoutButtonStyle } from "./style";
import type { SidebarProps } from "./interface";

export default function Sidebar({ items, activeKey, onSelect, user, onLogout }: SidebarProps) {
  return (
    <aside style={asideStyle}>
      <div>
        <div style={{ padding: 16, fontWeight: 700 }}>Painel de Demandas</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 8 }}>
          {items.map((it) => (
            <button key={it.key} style={navButtonStyle(activeKey === it.key)} onClick={() => onSelect(it.key)}>
              {it.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16, borderTop: `1px solid #e5e7eb` }}>
        <div style={{ fontSize: 14, opacity: 0.9 }}>{user?.name}</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>{user?.email}</div>
        <button onClick={onLogout} style={logoutButtonStyle}>Sair</button>
      </div>
    </aside>
  );
}

