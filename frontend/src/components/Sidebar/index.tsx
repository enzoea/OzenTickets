import { asideStyle, navButtonStyle, logoutButtonStyle } from "./style";
import type { SidebarProps, SidebarItem } from "./interface";
import { useEffect, useRef, useState } from "react";

export default function Sidebar({ items, activeKey, onSelect, user, onLogout, onCreateProject, canCreateProject = true, onRenameProject, onDeleteProject, userList = [], onLinkMember }: SidebarProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  const [ctxKey, setCtxKey] = useState<string | null>(null);
  const asideRef = useRef<HTMLElement | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const matches = searchTerm.trim() === "" ? [] : userList.filter((u) => {
    const q = searchTerm.trim().toLowerCase();
    return u.name.toLowerCase().includes(q) || String(u.email || "").toLowerCase().includes(q);
  }).slice(0, 5);

  useEffect(() => {
    if (!ctxKey) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) { setCtxKey(null); return; }
      const inCtx = target.closest('[data-role="ctx-menu"]');
      const inProjBtn = target.closest('[data-role="proj-button"]');
      if (inCtx || inProjBtn) return;
      setCtxKey(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ctxKey]);

  const renderItem = (it: SidebarItem) => {
    if (it.children && it.children.length > 0) {
      const isOpen = !!open[it.key];
      return (
        <div key={it.key}>
          <button data-role="proj-button" style={navButtonStyle(false)} onClick={() => toggle(it.key)} onContextMenu={(e) => { e.preventDefault(); setCtxKey(it.key); }}>
            {it.label} {isOpen ? "▾" : "▸"}
          </button>
          {ctxKey === it.key ? (
            <div data-role="ctx-menu" style={{ display: "flex", flexDirection: "column", gap: 8, margin: "6px 0 8px 12px" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={navButtonStyle(false)}
                  onClick={() => { setCtxKey(null); onRenameProject && onRenameProject(it.key); }}
                  disabled={!canCreateProject}
                >
                  Editar nome
                </button>
                <button
                  style={navButtonStyle(false)}
                  onClick={() => { setCtxKey(null); onDeleteProject && onDeleteProject(it.key); }}
                  disabled={!canCreateProject}
                >
                  Excluir projeto
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Vincular colaborador por nome ou e-mail"
                  style={{ width: 240, padding: 6, borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', color: '#111' }}
                />
                <button
                  style={navButtonStyle(false)}
                  onClick={() => {
                    if (!searchTerm.trim()) return;
                    onLinkMember && onLinkMember(it.key, { email: searchTerm.trim() });
                    setSearchTerm("");
                  }}
                  disabled={!canCreateProject}
                >
                  Vincular por e-mail
                </button>
              </div>
              {matches.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 0, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff' }}>
                  {matches.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => { onLinkMember && onLinkMember(it.key, { id: u.id }); setSearchTerm(""); }}
                      style={{ padding: 6, fontSize: 12, cursor: canCreateProject ? 'pointer' : 'default' }}
                    >
                      {u.name} <span style={{ opacity: 0.7 }}>({u.email})</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          {isOpen ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 12 }}>
              {it.children.map((ch) => (
                <button key={ch.key} style={navButtonStyle(activeKey === ch.key)} onClick={() => onSelect(ch.key)}>
                  {ch.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      );
    }
    return (
      <button key={it.key} style={navButtonStyle(activeKey === it.key)} onClick={() => onSelect(it.key)}>
        {it.label}
      </button>
    );
  };
  return (
    <aside ref={asideRef} style={asideStyle}>
      <div>
        <div style={{ padding: 16, fontWeight: 700 }}>Painel de Demandas</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 8 }}>
          {items.map(renderItem)}
          {onCreateProject ? (
            <button
              onClick={onCreateProject}
              style={navButtonStyle(false)}
              disabled={!canCreateProject}
            >
              + Cadastrar projeto
            </button>
          ) : null}
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
