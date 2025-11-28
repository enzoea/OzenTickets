import { useEffect, useState } from "react";
import { api } from "../../api";
import Input from "../../components/Input";
import PrimaryButton from "../../components/PrimaryButton";
import Modal from "../../components/Modal";
import Select from "../../components/Select";
import { theme } from "../../theme";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    setor: "",
    cargo: "",
    is_admin: false,
    tipo: "colaborador",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: null, name: "", email: "", password: "", setor: "", cargo: "", is_admin: false, tipo: "colaborador" });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      alert("Erro ao carregar usuários (ver console).");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      alert("Nome, e-mail e senha são obrigatórios.");
      return;
    }
    const emailOk = /.+@.+\..+/.test(form.email);
    if (!emailOk) {
      alert("Informe um e-mail válido.");
      return;
    }
    if (String(form.password).length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setSaving(true);
      await api.post("/users", form);
      setForm({
        name: "",
        email: "",
        password: "",
        setor: "",
        cargo: "",
        is_admin: false,
        tipo: "colaborador",
      });
      await loadUsers();
      setUserModalOpen(false);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      try {
        const status = error?.response?.status;
        if (status === 422) {
          const errs = error?.response?.data?.errors || {};
          const msgs = Object.values(errs).flat().filter(Boolean);
          alert(msgs.length > 0 ? msgs.join("\n") : "Dados inválidos (422). Verifique os campos.");
        } else if (status === 403) {
          alert("Você não tem permissão para cadastrar usuários.");
        } else if (status === 401) {
          alert("Sessão expirada. Faça login novamente.");
        } else {
          const msg = error?.response?.data?.message || "Erro ao criar usuário (ver console).";
          alert(msg);
        }
      } catch {
        alert("Erro ao criar usuário (ver console).");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja remover este usuário?")) return;

    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error("Erro ao remover usuário:", error);
      alert("Erro ao remover usuário (ver console).");
    }
  };

  const startEdit = (user) => {
    setEditForm({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      password: "",
      setor: user.setor || "",
      cargo: user.cargo || "",
      is_admin: !!user.is_admin,
      tipo: user.tipo || "colaborador",
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.email) {
      alert("Nome e e-mail são obrigatórios.");
      return;
    }
    const emailOk = /.+@.+\..+/.test(editForm.email);
    if (!emailOk) {
      alert("Informe um e-mail válido.");
      return;
    }
    if (editForm.password && String(editForm.password).length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: editForm.name,
        email: editForm.email,
        setor: editForm.setor || "",
        cargo: editForm.cargo || "",
        is_admin: !!editForm.is_admin,
        tipo: editForm.tipo || "colaborador",
      };
      if (editForm.password) payload.password = editForm.password;
      await api.put(`/users/${editForm.id}`, payload);
      await loadUsers();
      setEditModalOpen(false);
    } catch (error) {
      console.error("Erro ao editar usuário:", error);
      try {
        const status = error?.response?.status;
        if (status === 422) {
          const errs = error?.response?.data?.errors || {};
          const msgs = Object.values(errs).flat().filter(Boolean);
          alert(msgs.length > 0 ? msgs.join("\n") : "Dados inválidos (422). Verifique os campos.");
        } else if (status === 403) {
          alert("Você não tem permissão para editar usuários.");
        } else if (status === 401) {
          alert("Sessão expirada. Faça login novamente.");
        } else {
          const msg = error?.response?.data?.message || "Erro ao editar usuário (ver console).";
          alert(msg);
        }
      } catch {
        alert("Erro ao editar usuário (ver console).");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div
        className={loading ? "blur-loading" : ""}
        style={{
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <h3>Usuários cadastrados</h3>
          {loading ? (
            <p>Carregando...</p>
          ) : users.length === 0 ? (
            <p>Nenhum usuário encontrado.</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#fff",
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <thead>
                <tr style={{ background: "#d2d7db" }}>
                  <th style={th}>Nome</th>
                  <th style={th}>E-mail</th>
                  <th style={th}>Setor</th>
                  <th style={th}>Cargo</th>
                  <th style={th}>Admin</th>
                  <th style={th}>Tipo</th>
                  <th style={th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={td}>{u.name}</td>
                    <td style={td}>{u.email}</td>
                    <td style={td}>{u.setor}</td>
                    <td style={td}>{u.cargo}</td>
                    <td style={td}>{u.is_admin ? "Sim" : "Não"}</td>
                  <td style={td}>{u.tipo || "-"}</td>
                  <td style={td}>
                    <button
                      onClick={() => startEdit(u)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #1976d2",
                        background: "#1976d2",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 12,
                        marginRight: 8,
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "none",
                        background: "#ef5350",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Remover
                    </button>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <PrimaryButton onClick={() => setUserModalOpen(true)}>
          Cadastrar usuário
        </PrimaryButton>
      </div>
      <Modal
        open={userModalOpen}
        title="Cadastrar usuário"
        onClose={() => setUserModalOpen(false)}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
            <button
              onClick={() => setUserModalOpen(false)}
              style={{
                padding: "8px 12px",
                borderRadius: theme.radius.sm,
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.white,
                color: theme.colors.text,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <PrimaryButton type="submit" form="user-create-form" disabled={saving}>
              {saving ? "Salvando..." : "Cadastrar"}
            </PrimaryButton>
          </div>
        }
      >
        <form id="user-create-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
          <Input placeholder="Nome" value={form.name} onChange={(v) => handleChange("name", v)} />
          <Input placeholder="E-mail corporativo" value={form.email} onChange={(v) => handleChange("email", v)} />
          <Input placeholder="Senha" type="password" value={form.password} onChange={(v) => handleChange("password", v)} />
          <Input placeholder="Setor" value={form.setor} onChange={(v) => handleChange("setor", v)} />
          <Input placeholder="Cargo" value={form.cargo} onChange={(v) => handleChange("cargo", v)} />
          <div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>Tipo de usuário</div>
            <Select
              value={form.tipo}
              onChange={(v) => handleChange("tipo", v)}
              options={[
                { value: "colaborador", label: "Colaborador" },
                { value: "cliente", label: "Cliente" },
              ]}
              style={{ width: "100%" }}
            />
          </div>
          <label style={{ fontSize: 14 }}>
            <input type="checkbox" checked={form.is_admin} onChange={(e) => handleChange("is_admin", e.target.checked)} style={{ marginRight: 4 }} />
            Usuário administrador
          </label>
        </form>
      </Modal>

      <Modal
        open={editModalOpen}
        title="Editar usuário"
        onClose={() => setEditModalOpen(false)}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
            <button
              onClick={() => setEditModalOpen(false)}
              style={{
                padding: "8px 12px",
                borderRadius: theme.radius.sm,
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.white,
                color: theme.colors.text,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <PrimaryButton type="submit" form="user-edit-form" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </PrimaryButton>
          </div>
        }
      >
        <form id="user-edit-form" onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
          <Input placeholder="Nome" value={editForm.name} onChange={(v) => handleEditChange("name", v)} />
          <Input placeholder="E-mail corporativo" value={editForm.email} onChange={(v) => handleEditChange("email", v)} />
          <Input placeholder="Nova senha (opcional)" type="password" value={editForm.password} onChange={(v) => handleEditChange("password", v)} />
          <Input placeholder="Setor" value={editForm.setor} onChange={(v) => handleEditChange("setor", v)} />
          <Input placeholder="Cargo" value={editForm.cargo} onChange={(v) => handleEditChange("cargo", v)} />
          <div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>Tipo de usuário</div>
            <Select
              value={editForm.tipo}
              onChange={(v) => handleEditChange("tipo", v)}
              options={[
                { value: "colaborador", label: "Colaborador" },
                { value: "cliente", label: "Cliente" },
              ]}
              style={{ width: "100%" }}
            />
          </div>
          <label style={{ fontSize: 14 }}>
            <input type="checkbox" checked={editForm.is_admin} onChange={(e) => handleEditChange("is_admin", e.target.checked)} style={{ marginRight: 4 }} />
            Usuário administrador
          </label>
        </form>
      </Modal>
    </div>
  );
}


const th = {
  padding: 8,
  textAlign: "left",
  fontSize: 14,
  borderBottom: "1px solid #ddd",
};

const td = {
  padding: 8,
  fontSize: 14,
  borderBottom: "1px solid #eee",
};
