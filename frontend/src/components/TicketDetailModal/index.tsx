import { useEffect, useState } from "react";
import { api } from "../../api";
import { theme } from "../../theme";
import Input from "../Input";
import Select from "../Select";
import PrimaryButton from "../PrimaryButton";
import UpdatesList from "../UpdatesList";
import UpdateComposer from "../UpdateComposer";
import DatePicker from "../DatePicker";
import Modal from "../Modal";

const PRIORITY_OPTIONS = [
  { value: "urgente", label: "Urgente" },
  { value: "prioridade", label: "Prioridade" },
  { value: "padrao", label: "Padrão" },
  { value: "sem_prioridade", label: "Sem prioridade" },
];

type User = { id: number | string; name: string; email?: string };
type Ticket = {
  id: number;
  titulo: string;
  subtitulo?: string | null;
  descricao?: string | null;
  solicitante_id?: number | string | null;
  responsavel_id?: number | string | null;
  solicitante?: { id: number | string; name: string } | null;
  responsavel?: { id: number | string; name: string } | null;
  status: string;
  prioridade?: string | null;
  data_prevista?: string | null;
  created_at?: string | null;
};

interface Props {
  open: boolean;
  ticket: Ticket | null;
  users: User[];
  currentUserId?: number | string | null;
  onClose: () => void;
  onTicketPatched?: (id: number, patch: Partial<Ticket>) => void;
}

export default function TicketDetailModal({ open, ticket, users, currentUserId = null, onClose, onTicketPatched }: Props) {
  const readOnly = (() => {
    try {
      const s = localStorage.getItem("user");
      if (!s) return false;
      const u = JSON.parse(s);
      return u?.tipo === "cliente";
    } catch {
      return false;
    }
  })();
  const [draft, setDraft] = useState<{ titulo: string; subtitulo: string; descricao: string }>({ titulo: "", subtitulo: "", descricao: "" });
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updates, setUpdates] = useState<any[]>([]);
  const [newUpdateContent, setNewUpdateContent] = useState("");
  const [postingUpdate, setPostingUpdate] = useState(false);

  useEffect(() => {
    if (!ticket) return;
    setDraft({ titulo: ticket.titulo || "", subtitulo: ticket.subtitulo || "", descricao: ticket.descricao || "" });
    const load = async () => {
      try {
        const res = await api.get(`/tickets/${ticket.id}/updates`);
        setUpdates(Array.isArray(res.data)
          ? res.data.slice().sort((a, b) => {
              const at = a?.created_at ? new Date(a.created_at).getTime() : 0;
              const bt = b?.created_at ? new Date(b.created_at).getTime() : 0;
              return at - bt;
            })
          : res.data);
      } catch {}
    };
    load();
  }, [ticket]);

  if (!open || !ticket) return null;

  return (
    <Modal
      open={open}
      title={"Detalhes do ticket"}
      onClose={onClose}
      footer={
        <div style={{ display: "flex", gap: theme.spacing.sm, marginTop: theme.spacing.md, padding: theme.spacing.sm }}>
          <button
            onClick={onClose}
            style={{
              padding: "12px",
              borderRadius: theme.radius.sm,
              border: `1px solid ${theme.colors.border}`,
              background: theme.colors.white,
              color: theme.colors.text,
              cursor: "pointer",
              flex: 1,
            }}
          >
            Fechar
          </button>
          <PrimaryButton
            disabled={readOnly || saving || !draft.titulo.trim()}
            onClick={async () => {
              if (readOnly) return;
              try {
                setSaving(true);
                const payload = { titulo: draft.titulo, subtitulo: draft.subtitulo || null, descricao: draft.descricao || null };
                await api.put(`/tickets/${ticket.id}`, payload);
                onTicketPatched && onTicketPatched(ticket.id, payload);
                setEditingTitle(false);
                onClose();
              } catch {
              } finally {
                setSaving(false);
              }
            }}
            style={{ flex: 1, marginTop: 0, padding: "12px" }}
          >
            {saving ? "Salvando..." : "Confirmar alterações"}
          </PrimaryButton>
        </div>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: theme.spacing.md }}>
        <div style={{ display: "none" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Solicitante</div>
              <Select
                value={ticket.solicitante_id ? String(ticket.solicitante_id) : ""}
                onChange={async (v) => {
                  if (readOnly) return;
                  const nextId = v || null;
                  const nextUser = nextId ? users.find((u) => String(u.id) === String(nextId)) : undefined;
                  try {
                    await api.put(`/tickets/${ticket.id}`, { solicitante_id: nextId });
                    onTicketPatched && onTicketPatched(ticket.id, {
                      solicitante_id: nextId ? Number(nextId) : null,
                      solicitante: nextUser ? { id: nextUser.id, name: nextUser.name } : null,
                    });
                  } catch {}
                }}
                placeholder="Selecione"
                options={users.map((u) => ({ value: String(u.id), label: u.name }))}
                disabled={readOnly}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Responsável</div>
              <Select
                value={ticket.responsavel_id ? String(ticket.responsavel_id) : ""}
                onChange={async (v) => {
                  if (readOnly) return;
                  const nextId = v || null;
                  const nextUser = nextId ? users.find((u) => String(u.id) === String(nextId)) : undefined;
                  try {
                    await api.put(`/tickets/${ticket.id}`, { responsavel_id: nextId });
                    onTicketPatched && onTicketPatched(ticket.id, {
                      responsavel_id: nextId ? Number(nextId) : null,
                      responsavel: nextUser ? { id: nextUser.id, name: nextUser.name } : null,
                    });
                  } catch {}
                }}
                placeholder="Sem responsável"
                options={users.map((u) => ({ value: String(u.id), label: u.name }))}
                disabled={readOnly}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Previsão</div>
              <DatePicker
                value={ticket.data_prevista ? String(ticket.data_prevista).slice(0, 10) : ""}
                onChange={async (v) => {
                  if (readOnly) return;
                  try {
                    await api.put(`/tickets/${ticket.id}`, { data_prevista: v || null });
                    onTicketPatched && onTicketPatched(ticket.id, { data_prevista: v || null });
                  } catch {}
                }}
                disabled={readOnly}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Status</div>
              <Select
                value={ticket.status}
                onChange={async (v) => {
                  if (readOnly) return;
                  try {
                    await api.put(`/tickets/${ticket.id}`, { status: v });
                    onTicketPatched && onTicketPatched(ticket.id, { status: v });
                  } catch {}
                }}
                options={["backlog","a_fazer","fazendo","pronto","para_teste","em_teste","finalizado"].map((opt) => ({ value: opt, label: opt }))}
                disabled={readOnly}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>

        <div style={{ gridColumn: "1 / 3", gridRow: "2" }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Título</div>
          {editingTitle ? (
            <Input
              value={draft.titulo}
              onChange={(v) => setDraft((prev) => ({ ...prev, titulo: v }))}
              onBlur={() => setEditingTitle(false)}
              placeholder="Adicionar título"
              disabled={readOnly}
            />
          ) : (
            <div
              className="field-box"
              style={{ fontSize: 16, fontWeight: 700, cursor: readOnly ? "default" : "text" }}
              onClick={() => { if (!readOnly) setEditingTitle(true); }}
            >
              {draft.titulo || "(Sem título)"}
            </div>
          )}
        </div>

        <div style={{ gridColumn: "1 / 3", gridRow: "3" }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Subtítulo</div>
          {editingSubtitle ? (
            <Input
              value={draft.subtitulo}
              onChange={(v) => setDraft((prev) => ({ ...prev, subtitulo: v }))}
              onBlur={() => setEditingSubtitle(false)}
              placeholder="Adicionar subtítulo"
              disabled={readOnly}
            />
          ) : (
            <div
              className="field-box"
              style={{ fontSize: 14, cursor: readOnly ? "default" : "text" }}
              onClick={() => { if (!readOnly) setEditingSubtitle(true); }}
            >
              {draft.subtitulo || "Sem subtítulo"}
            </div>
          )}
        </div>

        <div style={{ gridColumn: "1 / 3", gridRow: "4" }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Descrição</div>
          {editingDescription ? (
            <Input
              multiline
              value={draft.descricao}
              onChange={(v) => setDraft((prev) => ({ ...prev, descricao: v }))}
              onBlur={() => setEditingDescription(false)}
              placeholder="Adicionar descrição"
              style={{ minHeight: 100 }}
              disabled={readOnly}
            />
          ) : (
            <div
              className="text-area-box"
              style={{ minHeight: 100, cursor: "text" }}
              onClick={() => setEditingDescription(true)}
            >
              {draft.descricao || "Sem descrição"}
            </div>
          )}
        </div>

        <div style={{ gridColumn: "1 / 2", gridRow: "5" }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Atualizações</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <UpdatesList
              updates={updates}
              currentUserId={readOnly ? null : currentUserId}
              onEdit={readOnly ? undefined : async (id, conteudo) => {
                try {
                  const res = await api.put(`/tickets/${ticket.id}/updates/${id}`, { conteudo });
                  setUpdates((prev) => prev.map((u) => (String(u.id) === String(id) ? res.data : u)));
                } catch {}
              }}
              onDelete={readOnly ? undefined : async (id) => {
                try {
                  await api.delete(`/tickets/${ticket.id}/updates/${id}`);
                  setUpdates((prev) => prev.filter((u) => String(u.id) !== String(id)));
                } catch {}
              }}
            />
            <UpdateComposer
              value={newUpdateContent}
              onChange={setNewUpdateContent}
              posting={postingUpdate}
              disabled={readOnly}
              onSubmit={async () => {
                if (readOnly) return;
                try {
                  setPostingUpdate(true);
                  const res = await api.post(`/tickets/${ticket.id}/updates`, { conteudo: String(newUpdateContent).trim() });
                  setUpdates((prev) => [...prev, res.data]);
                  setNewUpdateContent("");
                } catch {
                } finally {
                  setPostingUpdate(false);
                }
              }}
            />
          </div>
        </div>

        <div style={{ gridColumn: "2 / 3", gridRow: "5" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Criado em</div>
              <div className="field-box" style={{ fontSize: 14 }}>
                {ticket.created_at
                  ? (() => { const d = new Date(ticket.created_at); return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` })()
                  : "-"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Solicitante</div>
              <Select
                value={ticket.solicitante_id ? String(ticket.solicitante_id) : ""}
                onChange={async (v) => {
                  if (readOnly) return;
                  const nextId = v || null;
                  const nextUser = nextId ? users.find((u) => String(u.id) === String(nextId)) : undefined;
                  try {
                    await api.put(`/tickets/${ticket.id}`, { solicitante_id: nextId });
                    onTicketPatched && onTicketPatched(ticket.id, {
                      solicitante_id: nextId ? Number(nextId) : null,
                      solicitante: nextUser ? { id: nextUser.id, name: nextUser.name } : null,
                    });
                  } catch {}
                }}
                placeholder="Selecione"
                options={users.map((u) => ({ value: String(u.id), label: u.name }))}
                disabled={readOnly}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Responsável</div>
              <Select
                value={ticket.responsavel_id ? String(ticket.responsavel_id) : ""}
                onChange={async (v) => {
                  if (readOnly) return;
                  const nextId = v || null;
                  const nextUser = nextId ? users.find((u) => String(u.id) === String(nextId)) : undefined;
                  try {
                    await api.put(`/tickets/${ticket.id}`, { responsavel_id: nextId });
                    onTicketPatched && onTicketPatched(ticket.id, {
                      responsavel_id: nextId ? Number(nextId) : null,
                      responsavel: nextUser ? { id: nextUser.id, name: nextUser.name } : null,
                    });
                  } catch {}
                }}
                placeholder="Sem responsável"
                options={users.map((u) => ({ value: String(u.id), label: u.name }))}
                disabled={readOnly}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Previsão</div>
              <DatePicker
                value={ticket.data_prevista ? String(ticket.data_prevista).slice(0, 10) : ""}
                onChange={async (v) => {
                  if (readOnly) return;
                  try {
                    await api.put(`/tickets/${ticket.id}`, { data_prevista: v || null });
                    onTicketPatched && onTicketPatched(ticket.id, { data_prevista: v || null });
                  } catch {}
                }}
                disabled={readOnly}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Status</div>
              <Select
                value={ticket.status}
                onChange={async (v) => {
                  if (readOnly) return;
                  try {
                    await api.put(`/tickets/${ticket.id}`, { status: v });
                    onTicketPatched && onTicketPatched(ticket.id, { status: v });
                  } catch {}
                }}
                options={["backlog","a_fazer","fazendo","pronto","para_teste","em_teste","finalizado"].map((opt) => ({ value: opt, label: opt }))}
                disabled={readOnly}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Prioridade</div>
              <Select
                value={ticket.prioridade || "padrao"}
                onChange={async (v) => {
                  if (readOnly) return;
                  try {
                    await api.put(`/tickets/${ticket.id}`, { prioridade: v });
                    onTicketPatched && onTicketPatched(ticket.id, { prioridade: v });
                  } catch {}
                }}
                options={PRIORITY_OPTIONS}
                disabled={readOnly}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
