import { asideStyle, navButtonStyle, logoutButtonStyle } from "./style";
import type { SidebarProps, SidebarItem } from "./interface";
import { useEffect, useRef, useState } from "react";

export default function Sidebar({ items, activeKey, onSelect, user, onLogout, onCreateProject, canCreateProject = true, onRenameProject, onDeleteProject }: SidebarProps) {
  // Controle de grupos abertos/fechados por chave
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  const [ctxKey, setCtxKey] = useState<string | null>(null);
  const asideRef = useRef<HTMLElement | null>(null);

  // Fecha menu de contexto ao clicar fora
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

  // Abre automaticamente grupo "Projetos" quando ainda não há projetos
  useEffect(() => {
    const proj = items.find((it) => it.key === 'projects');
    if (proj && (!proj.children || proj.children.length === 0)) {
      setOpen((prev) => ({ ...prev, projects: true }));
    }
  }, [items]);

  // Renderiza item de menu (grupo ou item simples)
  const renderItem = (it: SidebarItem) => {
    const isProjectsGroup = it.key === 'projects';
    const hasChildren = isProjectsGroup || !!(it.children && it.children.length > 0);
    if (hasChildren) {
      const isOpen = !!open[it.key];
      const isProjectItem = it.key.startsWith('project:');
      return (
        <div key={it.key}>
          <button
            data-role="proj-button"
            style={navButtonStyle(false)}
            onClick={() => toggle(it.key)}
            onContextMenu={(e) => {
              if (!isProjectItem) return;
              e.preventDefault();
              setCtxKey(it.key);
            }}
          >
            {it.label} {isOpen ? "▾" : "▸"}
          </button>
          {ctxKey === it.key && isProjectItem ? (
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
            </div>
          ) : null}
          {isOpen ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 12, marginTop: (isProjectsGroup || isProjectItem) ? 12 : 0 }}>
              {it.children!.map((ch) => (
                <div key={ch.key}>
                  {ch.children && ch.children.length > 0
                    ? renderItem(ch)
                    : (
                      <button style={navButtonStyle(activeKey === ch.key)} onClick={() => onSelect(ch.key)}>
                        {ch.label}
                      </button>
                    )}
                </div>
              ))}
              {isProjectsGroup && onCreateProject ? (
                <button
                  onClick={onCreateProject}
                  style={navButtonStyle(false)}
                  disabled={!canCreateProject}
                >
                  + Cadastrar projeto
                </button>
              ) : null}
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
  const mainItems = items.filter((it) => it.key !== 'users');
  const usersItem = items.find((it) => it.key === 'users') || null;

  return (
    <aside ref={asideRef} style={asideStyle}>
      <div>
        <div style={{ padding: 16, fontWeight: 700 }}>Painel de Demandas</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 8 }}>
          {mainItems.map(renderItem)}
        </div>
      </div>

      <div style={{ padding: 16, borderTop: `1px solid #e5e7eb` }}>
        <div style={{ fontSize: 14, opacity: 0.9 }}>{user?.name}</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>{user?.email}</div>
        {usersItem ? (
          <div style={{ marginTop: 8 }}>
            <button
              style={navButtonStyle(activeKey === usersItem.key)}
              onClick={() => onSelect(usersItem.key)}
            >
              {usersItem.label}
            </button>
          </div>
        ) : null}
        <button onClick={onLogout} style={logoutButtonStyle}>Sair</button>
      </div>
    </aside>
  );
}
