import { useEffect, useState, useCallback } from "react";
import Login from "./screen/Login/index";
import Home from "./screen/Home/index";
import Dashboard from "./screen/Dashboard/index";
import KnowledgeBase from "./screen/KnowledgeBase/index";
import UsersPage from "./screen/UsersPage/index";
import Sidebar from "./components/Sidebar";
import { theme } from "./theme";
import "./styles.css";
import { api, setAuthToken } from "./api";

export default function App() {
  // Estado de autenticação carregado do localStorage.
  // Se houver token e usuário, propaga token para API e a app já inicia autenticada.
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      const user = JSON.parse(userStr);
      setAuthToken(token);
      return { token, user };
    }
    return { token: null, user: null };
  });
  // Navegação baseada em chave simples no estado
  const [page, setPage] = useState(null);
  // Lista de projetos do usuário autenticado
  const [projects, setProjects] = useState([]);
  // Lista básica de usuários (para vincular membros via painel do projeto)
  const [userList, setUserList] = useState([]);

  // Callback de login bem-sucedido da tela de Login
  const handleLogin = ({ token, user }) => {
    setAuth({ token, user });
    setPage("overview");
  };

  // Efetua logout e reseta estado de navegação
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null });
    setAuthToken(null);
    setPage(null);
  };

  // Hooks must remain top-level; render decides based on auth

  // Flag para renderizar itens de administração
  const isAdmin = auth.user?.is_admin;

  // Carrega projetos e lista básica de usuários após autenticação
  useEffect(() => {
    if (!auth.token) return;
    api.get("/projects").then((res) => {
      const list = res.data || [];
      setProjects(list);
      if (!page) {
        setPage("overview");
      }
    });
    api.get("/user-list").then((res) => setUserList(res.data || []));
  }, [auth.token, page]);

  // Interpreta a chave de navegação em { projectId, view }
  const parsePage = (p) => {
    if (!p) return { projectId: null, view: null };
    const m = String(p).match(/^project:(\d+):(tickets|dashboard|members)$/);
    if (m) return { projectId: Number(m[1]), view: m[2] };
    return { projectId: null, view: p };
  };

  // Cria um novo projeto e navega para seus tickets
  const onCreateProject = async () => {
    const nome = window.prompt("Nome do projeto");
    if (!nome || !nome.trim()) return;
    const res = await api.post("/projects", { nome: nome.trim() });
    const proj = res.data;
    setProjects((prev) => [...prev, proj]);
    const fresh = await api.get("/projects");
    setProjects(fresh.data || []);
    setPage(`project:${proj.id}:tickets`);
  };

  // Extrai o id do projeto a partir de chaves "project:<id>[:view]"
  const getProjectIdFromKey = (key) => {
    const m = String(key).match(/^project:(\d+)$/);
    if (m) return Number(m[1]);
    const m2 = String(key).match(/^project:(\d+):/);
    if (m2) return Number(m2[1]);
    return null;
  };

  // Renomeia um projeto via prompt simples
  const onRenameProject = async (projectKey) => {
    const id = getProjectIdFromKey(projectKey);
    if (!id) return;
    const current = projects.find((p) => p.id === id);
    const nome = window.prompt("Novo nome do projeto", current?.nome || "");
    if (!nome || !nome.trim()) return;
    const res = await api.put(`/projects/${id}`, { nome: nome.trim() });
    const updated = res.data;
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  // Exclui um projeto e ajusta navegação se necessário
  const onDeleteProject = async (projectKey) => {
    const id = getProjectIdFromKey(projectKey);
    if (!id) return;
    const ok = window.confirm("Excluir projeto? Todos os tickets e comentários vinculados serão removidos.");
    if (!ok) return;
    await api.delete(`/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setPage((prevPage) => {
      const { projectId } = parsePage(prevPage);
      if (projectId === id) {
        const next = projects.filter((p) => p.id !== id);
        return next.length > 0 ? `project:${next[0].id}:tickets` : null;
      }
      return prevPage;
    });
  };

  // Vincula colaborador ao projeto por id ou e-mail
  const onLinkMember = async (projectKey, payload) => {
    const id = getProjectIdFromKey(projectKey);
    if (!id) return;
    if (payload?.id) {
      await api.post(`/projects/${id}/members`, { user_id: payload.id });
    } else if (payload?.email) {
      await api.post(`/projects/${id}/members`, { email: payload.email });
    }
  };

  // Desvincula colaborador; se o usuário atual sair, remove o projeto da navegação
  const onUnlinkMember = async (projectId, userId) => {
    await api.delete(`/projects/${projectId}/members/${userId}`);
    if (auth.user?.id === userId) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setPage((prevPage) => {
        const { projectId: pid } = parsePage(prevPage);
        if (pid === projectId) {
          const next = projects.filter((p) => p.id !== projectId);
          return next.length > 0 ? `project:${next[0].id}:tickets` : null;
        }
        return prevPage;
      });
    }
  };

  if (!auth.token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div
      style={{
        fontFamily: "system-ui",
        display: "flex",
        minHeight: "100vh",
        background: theme.colors.gray,
      }}
    >
      <Sidebar
        items={[
          { key: "overview", label: "Visão Geral" },
          { key: "kb", label: "Base de conhecimento" },
          {
            key: "projects",
            label: "Projetos",
            children: projects.map((p) => ({
              key: `project:${p.id}`,
              label: p.nome,
              children: [
                { key: `project:${p.id}:tickets`, label: "Tickets" },
                { key: `project:${p.id}:dashboard`, label: "Dashboard" },
                { key: `project:${p.id}:members`, label: "Vincular colaborador" },
              ],
            })),
          },
          ...(isAdmin ? [{ key: "users", label: "Usuários" }] : []),
        ]}
        activeKey={page ?? ""}
        onSelect={(key) => setPage(key)}
        user={auth.user}
        onLogout={handleLogout}
        onCreateProject={onCreateProject}
        canCreateProject={true}
        onRenameProject={onRenameProject}
        onDeleteProject={onDeleteProject}
        userList={userList}
        onLinkMember={onLinkMember}
      />

      <main style={{ flex: 1, padding: "24px 0 0 24px", minWidth: 0, marginLeft: theme.layout.sidebarWidth }}>
        {(() => {
          const { projectId, view } = parsePage(page);
          if (view === "users" && isAdmin) return <UsersPage />;
          if (view === "overview") return <Dashboard />;
          if (view === "kb") return <KnowledgeBase />;
          if (!projectId) {
            return (
              <div style={{ padding: 24 }}>
                Selecione um projeto no menu à esquerda ou cadastre um novo.
              </div>
            );
          }
          if (view === "tickets") return <Home projectId={projectId} />;
          if (view === "dashboard") return <Dashboard projectId={projectId} />;
          if (view === "members") {
            return (
              <ProjectMembersPanel
                projectId={projectId}
                userList={userList}
                onLinkMember={onLinkMember}
                currentUser={auth.user}
                onUnlinkMember={onUnlinkMember}
              />
            );
          }
          return null;
        })()}
      </main>
    </div>
  );
}

function ProjectMembersPanel({ projectId, userList, onLinkMember, currentUser, onUnlinkMember }) {
  const [members, setMembers] = useState([]);
  const [term, setTerm] = useState("");
  const [busy, setBusy] = useState(false);

  const loadMembers = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${projectId}/members`);
      setMembers(res.data || []);
    } catch (e) {
      console.error(e);
    }
  }, [projectId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const matches = term.trim() === "" ? [] : (userList || []).filter((u) => {
    const q = term.trim().toLowerCase();
    return u.name.toLowerCase().includes(q) || String(u.email || "").toLowerCase().includes(q);
  }).slice(0, 8);

  return (
    <div style={{ padding: 24 }}>
      <h3>Vincular colaborador ao projeto</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Pesquisar por nome ou e-mail"
          style={{ width: 360, padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', background: theme.colors.white, color: theme.colors.text }}
        />
        <button
          onClick={async () => {
            if (!term.trim()) return;
            try {
              setBusy(true);
              await onLinkMember?.(`project:${projectId}`, { email: term.trim() });
              setTerm("");
              await loadMembers();
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
          style={{ padding: "8px 12px", borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', cursor: busy ? 'default' : 'pointer' }}
        >
          Vincular por e-mail
        </button>
      </div>

      {matches.length > 0 ? (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6, border: `1px solid ${theme.colors.border}`, borderRadius: 6, background: theme.colors.white }}>
          {matches.map((u) => (
            <div
              key={u.id}
              onClick={async () => {
                try {
                  setBusy(true);
                  await onLinkMember?.(`project:${projectId}`, { id: u.id });
                  setTerm("");
                  await loadMembers();
                } finally {
                  setBusy(false);
                }
              }}
              style={{ padding: 8, cursor: busy ? 'default' : 'pointer' }}
            >
              {u.name} <span style={{ opacity: 0.7 }}>({u.email})</span>
            </div>
          ))}
        </div>
      ) : null}

      <div style={{ marginTop: 24 }}>
        <h4>Colaboradores vinculados</h4>
        {Array.isArray(members) && members.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {members.map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  {m.name} <span style={{ opacity: 0.7 }}>({m.email})</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {currentUser?.id !== m.id ? (
                    <button
                      onClick={async () => {
                        try {
                          setBusy(true);
                          await onUnlinkMember?.(projectId, m.id);
                          await loadMembers();
                        } finally {
                          setBusy(false);
                        }
                      }}
                      disabled={busy}
                      style={{ padding: "6px 10px", borderRadius: 6, border: '1px solid #e5e7eb', background: theme.colors.white, color: theme.colors.text, cursor: busy ? 'default' : 'pointer' }}
                    >
                      Desvincular usuário
                    </button>
                  ) : null}
                  {currentUser?.id === m.id ? (
                    <button
                      onClick={async () => {
                        try {
                          setBusy(true);
                          await onUnlinkMember?.(projectId, m.id);
                          await loadMembers();
                        } finally {
                          setBusy(false);
                        }
                      }}
                      disabled={busy}
                      style={{ padding: "6px 10px", borderRadius: 6, border: '1px solid #e5e7eb', background: theme.colors.white, color: theme.colors.text, cursor: busy ? 'default' : 'pointer' }}
                    >
                      Sair deste projeto
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ opacity: 0.7 }}>Nenhum colaborador vinculado ainda.</div>
        )}
      </div>
    </div>
  );
}
