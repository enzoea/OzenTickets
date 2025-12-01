import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "../../api";
import Input from "../../components/Input";
import PrimaryButton from "../../components/PrimaryButton";
import UpdatesList from "../../components/UpdatesList";
import UpdateComposer from "../../components/UpdateComposer";
import Select from "../../components/Select";
import DatePicker from "../../components/DatePicker";
import { theme } from "../../theme";
import { formatDate, isToday } from "./utils/format";
import Modal from "../../components/Modal";

const STATUS_OPTIONS = [
  "backlog",
  "a_fazer",
  "fazendo",
  "pronto",
  "para_teste",
  "em_teste",
  "finalizado",
];

const PRIORITY_OPTIONS = [
  { value: "urgente", label: "Urgente" },
  { value: "prioridade", label: "Prioridade" },
  { value: "padrao", label: "Padrão" },
  { value: "sem_prioridade", label: "Sem prioridade" },
];

const priorityColor = (p) => {
  switch (p) {
    case "urgente":
      return "#d32f2f";
    case "prioridade":
      return "#f57c00";
    case "sem_prioridade":
      return "#2da44e";
    case "padrao":
    default:
      return theme.colors.blueOutline;
  }
};

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // estados do formulário de criação
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState("backlog");
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [responsavelId, setResponsavelId] = useState("");
  const [solicitanteId, setSolicitanteId] = useState("");
  const [dataPrevista, setDataPrevista] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForStatus, setCreateForStatus] = useState("backlog");
  const [detailTicket, setDetailTicket] = useState(null);
  const [detailDraft, setDetailDraft] = useState({ titulo: "", subtitulo: "", descricao: "" });
  const [detailUpdates, setDetailUpdates] = useState([]);
  const [newUpdateContent, setNewUpdateContent] = useState("");
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [detailSaving, setDetailSaving] = useState(false);
  const [prioridade, setPrioridade] = useState("padrao");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const filterContainerRef = useRef(null);
  const filterContentRef = useRef(null);
  const [draftSelectedUserIds, setDraftSelectedUserIds] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserTipo, setCurrentUserTipo] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateCreatedFrom, setDateCreatedFrom] = useState("");
  const [dateCreatedTo, setDateCreatedTo] = useState("");
  

  const isReadOnly = String(currentUserTipo) === "cliente";

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/tickets");
      setTickets(response.data);
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
    api.get("/user-list").then((res) => setUsers(res.data));
    const userStr = localStorage.getItem("user");
    if (userStr) {
      let u = null;
      try {
        u = JSON.parse(userStr);
      } catch {
        u = null;
      }
      if (u?.id) {
        const sid = [String(u.id)];
        setSelectedUserIds(sid);
        setDraftSelectedUserIds(sid);
        setSolicitanteId(String(u.id));
        setCurrentUserId(String(u.id));
        setCurrentUserTipo(u?.tipo || null);
      }
    }
  }, [loadTickets]);

  useEffect(() => {
    const fetchUpdates = async () => {
      if (!detailTicket?.id) return;
      try {
        const res = await api.get(`/tickets/${detailTicket.id}/updates`);
        setDetailUpdates(Array.isArray(res.data)
          ? res.data.slice().sort((a, b) => {
              const at = a?.created_at ? new Date(a.created_at).getTime() : 0;
              const bt = b?.created_at ? new Date(b.created_at).getTime() : 0;
              return at - bt;
            })
          : res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUpdates();
  }, [detailTicket]);

  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e) => {
      const el = filterContainerRef.current;
      if (el && !el.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  useEffect(() => {
    if (filterOpen) setDraftSelectedUserIds(selectedUserIds);
  }, [filterOpen, selectedUserIds]);

  

  

  

  const handleCreateTicket = async (event) => {
    event.preventDefault();
    if (!titulo.trim()) {
      alert("Informe um título para o ticket.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/tickets", {
        titulo,
        subtitulo: subtitulo || null,
        descricao,
        status,
        responsavel_id: responsavelId || null,
        solicitante_id: solicitanteId || null,
        data_prevista: dataPrevista || null,
        prioridade: prioridade || "padrao",
      });

      // limpa o formulário
      setTitulo("");
      setSubtitulo("");
      setDescricao("");
      setStatus("backlog");
      setResponsavelId("");
      setDataPrevista("");
      setPrioridade("padrao");

      // recarrega a lista
      await loadTickets();
    } catch (error) {
      console.error("Erro ao criar ticket:", error);
      alert("Erro ao criar ticket. Veja o console para mais detalhes.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await api.put(`/tickets/${id}`, { status: newStatus });
      // atualiza só em memória pra não precisar refazer GET se não quiser
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === id ? { ...ticket, status: newStatus } : ticket
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Não foi possível atualizar o status desse ticket.");
    }
  };

  const reorderTicketRelative = (dragId, targetId, position, targetStatus) => {
    setTickets((prev) => {
      const list = [...prev];
      const dragIndex = list.findIndex((t) => t.id === dragId);
      const targetIndexOrig = list.findIndex((t) => t.id === targetId);
      if (dragIndex === -1 || targetIndexOrig === -1) return prev;
      const dragItem = list[dragIndex];
      if (targetStatus && dragItem.status !== targetStatus) {
        list[dragIndex] = { ...dragItem, status: targetStatus };
      }
      const adjustedTargetIndex = targetIndexOrig - (dragIndex < targetIndexOrig ? 1 : 0);
      const [removed] = list.splice(dragIndex, 1);
      const insertIndex = position === "before" ? adjustedTargetIndex : adjustedTargetIndex + 1;
      list.splice(insertIndex, 0, removed);
      return list;
    });
  };

  const isValidDateStr = (s) => {
    if (!s) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const d = new Date(`${s}T00:00:00`);
    return !Number.isNaN(d.getTime());
  };

  const inDateRange = (s, from, to) => {
    if (!from && !to) return true;
    if (!s) return false;
    const base = String(s).slice(0, 10);
    if (!isValidDateStr(base)) return false;
    const d = new Date(`${base}T00:00:00`);
    if (Number.isNaN(d.getTime())) return false;
    let ok = true;
    if (from && isValidDateStr(from)) {
      const f = new Date(`${from}T00:00:00`);
      ok = ok && d.getTime() >= f.getTime();
    }
    if (to && isValidDateStr(to)) {
      const t = new Date(`${to}T23:59:59`);
      ok = ok && d.getTime() <= t.getTime();
    }
    return ok;
  };

  

  const filterDropdown = filterOpen ? (
    <div
      className="fade-in"
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        zIndex: 1000,
        marginTop: 4,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.radius.sm,
        background: theme.colors.white,
        boxShadow: theme.shadow.sm,
        overflow: "hidden",
        minWidth: 260,
        maxHeight: 400,
      }}
    >
      <div ref={filterContentRef} style={{ padding: theme.spacing.sm }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing.sm }}>
          <div style={{ fontWeight: 600 }}>Pessoas</div>
          <button
            onClick={() => setFilterOpen(false)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              color: theme.colors.text,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 296, overflowY: "auto" }}>
          <label className="checkbox-option">
            <input
              type="checkbox"
              className="pretty-check"
              checked={draftSelectedUserIds.includes("__none__")}
              onChange={(e) => {
                setDraftSelectedUserIds((prev) => {
                  if (e.target.checked) return Array.from(new Set([...prev, "__none__"]));
                  return prev.filter((x) => x !== "__none__");
                });
              }}
            />
            <span className="checkbox-visual"></span>
            <span>Sem responsável</span>
          </label>

          {users.length === 0 ? (
            <div style={{ fontSize: 14, color: "#666" }}>Carregando usuários...</div>
          ) : (
            users.map((u) => {
              const id = String(u.id);
              const checked = draftSelectedUserIds.includes(id);
              return (
                <label key={u.id} className="checkbox-option">
                  <input
                    type="checkbox"
                    className="pretty-check"
                    checked={checked}
                    onChange={(e) => {
                      setDraftSelectedUserIds((prev) => {
                        if (e.target.checked) return Array.from(new Set([...prev, id]));
                        return prev.filter((x) => x !== id);
                      });
                    }}
                  />
                  <span className="checkbox-visual"></span>
                  <span>{u.name}</span>
                </label>
              );
            })
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: theme.spacing.sm, borderTop: `1px solid ${theme.colors.border}`, marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm }}>
          <button
            onClick={() => {
              setFilterOpen(false);
              setDraftSelectedUserIds(selectedUserIds);
            }}
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
          <button
            onClick={() => {
              setSelectedUserIds(draftSelectedUserIds);
              setFilterOpen(false);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: theme.radius.sm,
              border: "none",
              background: theme.colors.primary,
              color: theme.colors.white,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Exibir resultados
          </button>
        </div>
      </div>
    </div>
  ) : null;

  

  return (
    <div
      style={{
        padding: 0,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div ref={filterContainerRef}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Filtros</div>
            
          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className="fade-in"
                style={{
                  padding: "6px 10px",
                  borderRadius: theme.radius.sm,
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.white,
                  color: theme.colors.text,
                  cursor: "pointer",
                  boxShadow: filterOpen ? theme.shadow.sm : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minWidth: 120,
                }}
              >
                <span>Pessoas</span>
                <span style={{ fontSize: 14 }}>{filterOpen ? "▴" : "▾"}</span>
              </button>
              {filterDropdown}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontWeight: 600 }}>Previsão</div>
              <DatePicker value={dateFrom || ""} onChange={setDateFrom} />
              <span style={{ opacity: 0.7 }}>—</span>
              <DatePicker value={dateTo || ""} onChange={setDateTo} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontWeight: 600 }}>Criação</div>
              <DatePicker value={dateCreatedFrom || ""} onChange={setDateCreatedFrom} />
              <span style={{ opacity: 0.7 }}>—</span>
              <DatePicker value={dateCreatedTo || ""} onChange={setDateCreatedTo} />
            </div>
            <button
              onClick={() => {
                setSelectedUserIds([]);
                setDraftSelectedUserIds([]);
                setDateFrom("");
                setDateTo("");
                setDateCreatedFrom("");
                setDateCreatedTo("");
                setFilterOpen(false);
              }}
              className="fade-in"
              style={{
                padding: "6px 10px",
                borderRadius: theme.radius.sm,
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.white,
                color: theme.colors.text,
                cursor: "pointer",
              }}
            >
              Limpar filtros
            </button>
          </div>
          </div>
        </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {selectedUserIds.length > 0 && (
              <div style={{ fontSize: 13, color: theme.colors.text }}>
                {selectedUserIds
                  .map((id) => id === "__none__" ? "Sem responsável" : users.find((u) => String(u.id) === String(id))?.name)
                  .filter(Boolean)
                  .join(", ")}
              </div>
            )}
            {(() => {
              const parts = [];
              if (dateFrom || dateTo) {
                parts.push(
                  `${dateFrom ? `Previsão de ${new Date(`${dateFrom}T00:00:00`).toLocaleDateString("pt-BR")}` : "Previsão"}` +
                  `${dateTo ? ` até ${new Date(`${dateTo}T00:00:00`).toLocaleDateString("pt-BR")}` : ""}`
                );
              }
              if (dateCreatedFrom || dateCreatedTo) {
                parts.push(
                  `${dateCreatedFrom ? `Criados de ${new Date(`${dateCreatedFrom}T00:00:00`).toLocaleDateString("pt-BR")}` : "Criados"}` +
                  `${dateCreatedTo ? ` até ${new Date(`${dateCreatedTo}T00:00:00`).toLocaleDateString("pt-BR")}` : ""}`
                );
              }
              if (parts.length === 0) return null;
              return (
                <div style={{ fontSize: 13, color: theme.colors.text }}>
                  {parts.join(" | ")}
                </div>
              );
            })()}
          </div>
        </div>
      {/* LISTAGEM DE TICKETS */}
      {loading && <p>Carregando tickets...</p>}

      {!loading && tickets.length === 0 && (
        <p>Nenhum ticket cadastrado ainda.</p>
      )}

      <div
        id="board-scroll"
        className={loading ? "blur-loading" : ""}
        style={{
          display: "flex",
          gap: theme.spacing.md,
          alignItems: "flex-start",
          flexWrap: "nowrap",
          overflowX: "auto",
          overflowY: "hidden",
          marginTop: theme.spacing.md,
          height: "calc(100vh - 24px)",
        }}
      >
        {STATUS_OPTIONS.map((col) => (
          <div
            key={col}
            className="column fade-in"
            style={{
              minWidth: 320,
              background: theme.colors.white,
              borderRadius: theme.radius.md,
              padding: 12,
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.shadow.sm,
            }}
            onDragOver={(e) => { if (!isReadOnly) e.preventDefault(); }}
            onDrop={(e) => {
              if (isReadOnly) return;
              const idStr = e.dataTransfer.getData("text/plain");
              if (idStr) {
                handleChangeStatus(Number(idStr), col);
              }
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{col}</div>

            {tickets
              .filter((t) => t.status === col)
              .filter((t) =>
                selectedUserIds.length === 0
                  ? true
                  : (
                      (selectedUserIds.includes("__none__") ? t.responsavel_id == null : false) ||
                      selectedUserIds.includes(String(t.responsavel_id))
                    )
              )
              .filter((t) => {
                const usePrev = Boolean(dateFrom || dateTo);
                const useCreated = Boolean(dateCreatedFrom || dateCreatedTo);
                const okPrev = inDateRange(t.data_prevista, dateFrom, dateTo);
                const okCreated = inDateRange(t.created_at, dateCreatedFrom, dateCreatedTo);
                return (usePrev ? okPrev : true) && (useCreated ? okCreated : true);
              })
              .map((ticket) => (
                <div
                  key={ticket.id}
                  draggable={!isReadOnly}
                  onDragStart={(e) => { if (!isReadOnly) e.dataTransfer.setData("text/plain", String(ticket.id)); }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    if (isReadOnly) return;
                    e.preventDefault();
                    e.stopPropagation();
                    const dragIdStr = e.dataTransfer.getData("text/plain");
                    if (!dragIdStr) return;
                    const dragId = Number(dragIdStr);
                    if (!dragId || dragId === ticket.id) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const before = e.clientY < rect.top + rect.height / 2;
                    reorderTicketRelative(dragId, ticket.id, before ? "before" : "after", col);
                    const dragged = tickets.find((t) => t.id === dragId);
                    if (dragged && dragged.status !== col) {
                      handleChangeStatus(dragId, col);
                    }
                  }}
                  onClick={() => {
                    setDetailTicket(ticket);
                    setDetailDraft({ titulo: ticket.titulo || "", subtitulo: ticket.subtitulo || "", descricao: ticket.descricao || "" });
                    setEditingTitle(false);
                    setEditingSubtitle(false);
                    setEditingDescription(false);
                  }}
                  className="card fade-in"
                  style={{
                    background: theme.colors.white,
                    borderRadius: theme.radius.sm,
                    padding: 12,
                    border: `1px solid ${theme.colors.border}`,
                    borderLeft: `3px solid ${priorityColor(ticket.prioridade || "padrao")}`,
                    minHeight: 100,
                    marginBottom: 8,
                    cursor: "pointer",
                    transition: `box-shadow ${theme.transition.fast}, transform ${theme.transition.fast}`,
                  }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{ticket.titulo}</div>
                      <div style={{ fontSize: 12, color: "#666" }}>#{ticket.codigo ?? ticket.id}</div>
                    </div>
                    <div style={{ fontSize: 14, color: "#555", marginTop: 4, whiteSpace: "pre-wrap" }}>
                      {ticket.descricao ? ticket.descricao : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, marginTop: 4 }}>
                    <div><b>Solicitante:</b> {ticket.solicitante?.name ?? "(Não informado)"}</div>
                    <div><b>Responsável:</b> {ticket.responsavel?.name ?? "Sem responsável"}</div>
                    <div>
                      <b>Previsão:</b>{" "}
                      <span style={{ color: (ticket.data_prevista && isToday(ticket.data_prevista)) ? theme.colors.danger : undefined }}>
                        {formatDate(ticket.data_prevista)}
                      </span>
                    </div>
                  </div>

                  
                </div>
              ))}

            <PrimaryButton
              onClick={() => {
                setStatus(col);
                setTitulo("");
                setDescricao("");
                setResponsavelId("");
                setPrioridade("padrao");
                setCreateForStatus(col);
                setCreateModalOpen(true);
              }}
              style={{ width: "100%" }}
              disabled={isReadOnly}
            >
              Criar novo ticket
            </PrimaryButton>
          </div>
        ))}
      </div>
      <Modal
        open={createModalOpen && !isReadOnly}
        title="Novo ticket"
        onClose={() => setCreateModalOpen(false)}
        footer={
          <div style={{ display: "flex", gap: theme.spacing.sm, marginTop: theme.spacing.md, padding: theme.spacing.sm }}>
            <button
              onClick={() => setCreateModalOpen(false)}
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
              Cancelar
            </button>
            <PrimaryButton onClick={handleCreateTicket} disabled={isReadOnly || saving} style={{ flex: 1, marginTop: 0, padding: "12px" }}>
              {saving ? "Salvando..." : "Criar"}
            </PrimaryButton>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
          <div>
            <div style={{ fontSize: theme.typography.baseSize, marginBottom: theme.spacing.xs }}>Título</div>
            <Input value={titulo} onChange={setTitulo} placeholder="Ex: Implementar tela de login" />
          </div>
          <div>
            <div style={{ fontSize: theme.typography.baseSize, marginBottom: theme.spacing.xs }}>Subtítulo</div>
            <Input value={subtitulo} onChange={setSubtitulo} placeholder="Resumo curto (opcional)" />
          </div>
          <div>
            <div style={{ fontSize: theme.typography.baseSize, marginBottom: theme.spacing.xs }}>Descrição</div>
            <Input multiline value={descricao} onChange={setDescricao} placeholder="Detalhes do chamado (opcional)" />
          </div>
          <div>
            <div style={{ fontSize: theme.typography.baseSize, marginBottom: theme.spacing.xs }}>Solicitante</div>
            <Select
              value={solicitanteId}
              onChange={setSolicitanteId}
              placeholder="Selecione"
              options={users.map((u) => ({ value: String(u.id), label: `${u.name} (${u.email})` }))}
            />
          </div>
          <div>
            <div style={{ fontSize: theme.typography.baseSize, marginBottom: theme.spacing.xs }}>Responsável (opcional)</div>
            <Select
              value={responsavelId}
              onChange={setResponsavelId}
              placeholder="Não atribuir"
              options={users.map((u) => ({ value: String(u.id), label: `${u.name} (${u.email})` }))}
            />
          </div>
          <div>
            <div style={{ fontSize: theme.typography.baseSize, marginBottom: theme.spacing.xs }}>Data prevista (opcional)</div>
            <DatePicker value={dataPrevista} onChange={setDataPrevista} />
          </div>
          <div>
            <div style={{ fontSize: theme.typography.baseSize, marginBottom: theme.spacing.xs }}>Prioridade</div>
            <Select
              value={prioridade}
              onChange={setPrioridade}
              options={PRIORITY_OPTIONS}
              placeholder="Padrão"
              style={{ width: 200 }}
            />
          </div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Status: {createForStatus}</div>
        </div>
      </Modal>

      <Modal
        open={Boolean(detailTicket)}
        title={detailTicket ? "Detalhes do ticket" : ""}
        onClose={() => setDetailTicket(null)}
        footer={
          detailTicket ? (
            <div style={{ display: "flex", gap: theme.spacing.sm, marginTop: theme.spacing.md, padding: theme.spacing.sm }}>
              <button
                onClick={() => setDetailTicket(null)}
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
                disabled={isReadOnly || detailSaving || !detailDraft.titulo.trim()}
                onClick={async () => {
                  if (isReadOnly) return;
                  try {
                    setDetailSaving(true);
                    const payload = { titulo: detailDraft.titulo, subtitulo: detailDraft.subtitulo || null, descricao: detailDraft.descricao || null };
                    await api.put(`/tickets/${detailTicket.id}`, payload);
                    setDetailTicket((prev) => (prev ? { ...prev, ...payload } : prev));
                    setTickets((prev) => prev.map((t) => (t.id === detailTicket.id ? { ...t, ...payload } : t)));
                    setEditingTitle(false);
                    setDetailTicket(null);
                  } catch (error) {
                    alert("Não foi possível salvar as alterações do título/subtítulo.");
                    console.error(error);
                  } finally {
                    setDetailSaving(false);
                  }
                }}
                style={{ flex: 1, marginTop: 0, padding: "12px" }}
              >
                {detailSaving ? "Salvando..." : "Confirmar alterações"}
              </PrimaryButton>
            </div>
          ) : null
        }
      >
        {detailTicket ? (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: theme.spacing.md }}>
            <div style={{ display: "none" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Solicitante</div>
                  <Select
                    value={detailTicket.solicitante_id ? String(detailTicket.solicitante_id) : ""}
                    onChange={async (v) => {
                      const nextId = v || null;
                      const nextUser = nextId ? users.find((u) => String(u.id) === String(nextId)) : null;
                      setDetailTicket((prev) => (prev ? { ...prev, solicitante_id: nextId, solicitante: nextUser ? { id: nextUser.id, name: nextUser.name } : null } : prev));
                      await api.put(`/tickets/${detailTicket.id}`, { solicitante_id: nextId });
                      setTickets((prev) => prev.map((t) => (
                        t.id === detailTicket.id
                          ? {
                              ...t,
                              solicitante_id: nextId ? Number(nextId) : null,
                              solicitante: nextUser ? { id: nextUser.id, name: nextUser.name } : null,
                            }
                          : t
                      )));
                    }}
                    placeholder="Selecione"
                    options={users.map((u) => ({ value: String(u.id), label: u.name }))}
                    disabled={isReadOnly}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Responsável</div>
                  <Select
                    value={detailTicket.responsavel_id ? String(detailTicket.responsavel_id) : ""}
                    onChange={async (v) => {
                      const nextId = v || null;
                      const nextUser = nextId ? users.find((u) => String(u.id) === String(nextId)) : null;
                      setDetailTicket((prev) => (prev ? { ...prev, responsavel_id: nextId, responsavel: nextUser ? { id: nextUser.id, name: nextUser.name } : null } : prev));
                      await api.put(`/tickets/${detailTicket.id}`, { responsavel_id: nextId });
                      setTickets((prev) => prev.map((t) => (
                        t.id === detailTicket.id
                          ? {
                              ...t,
                              responsavel_id: nextId ? Number(nextId) : null,
                              responsavel: nextUser ? { id: nextUser.id, name: nextUser.name } : null,
                            }
                          : t
                      )));
                    }}
                    placeholder="Sem responsável"
                    options={users.map((u) => ({ value: String(u.id), label: u.name }))}
                    disabled={isReadOnly}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Previsão</div>
                  <DatePicker
                    value={detailTicket.data_prevista ? String(detailTicket.data_prevista).slice(0, 10) : ""}
                    onChange={async (v) => {
                      setDetailTicket((prev) => (prev ? { ...prev, data_prevista: v } : prev));
                      try {
                        await api.put(`/tickets/${detailTicket.id}`, { data_prevista: v || null });
                        setTickets((prev) => prev.map((t) => (t.id === detailTicket.id ? { ...t, data_prevista: v || null } : t)));
                      } catch (error) {
                        console.error(error);
                        alert("Não foi possível atualizar a previsão.");
                      }
                    }}
                    disabled={isReadOnly}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Status</div>
                  <Select
                    value={detailTicket.status}
                    onChange={async (v) => {
                      await handleChangeStatus(detailTicket.id, v);
                      setDetailTicket((prev) => (prev ? { ...prev, status: v } : prev));
                    }}
                    options={STATUS_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
                    disabled={isReadOnly}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Prioridade</div>
                  <Select
                    value={detailTicket.prioridade || "padrao"}
                    onChange={async (v) => {
                      try {
                        await api.put(`/tickets/${detailTicket.id}`, { prioridade: v });
                        setDetailTicket((prev) => (prev ? { ...prev, prioridade: v } : prev));
                        setTickets((prev) => prev.map((t) => (t.id === detailTicket.id ? { ...t, prioridade: v } : t)));
                      } catch (error) {
                        alert("Não foi possível atualizar a prioridade.");
                        console.error(error);
                      }
                    }}
                    options={PRIORITY_OPTIONS}
                    disabled={isReadOnly}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
            <div style={{ gridColumn: "1 / 3", gridRow: "2" }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Título</div>
              {editingTitle ? (
                <Input
                  value={detailDraft.titulo}
                  onChange={(v) => setDetailDraft((prev) => ({ ...prev, titulo: v }))}
                  onBlur={() => setEditingTitle(false)}
                  placeholder="Adicionar título"
                />
              ) : (
                <div
                  className="field-box"
                  style={{ fontSize: 16, fontWeight: 700, cursor: isReadOnly ? "default" : "text" }}
                  onClick={() => { if (!isReadOnly) setEditingTitle(true); }}
                >
                  {detailDraft.titulo || "(Sem título)"}
                </div>
              )}
            </div>

            <div style={{ gridColumn: "1 / 3", gridRow: "3" }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Subtítulo</div>
              {editingSubtitle ? (
                <Input
                  value={detailDraft.subtitulo}
                  onChange={(v) => setDetailDraft((prev) => ({ ...prev, subtitulo: v }))}
                  onBlur={() => setEditingSubtitle(false)}
                  placeholder="Adicionar subtítulo"
                />
              ) : (
                <div
                  className="field-box"
                  style={{ fontSize: 14, cursor: isReadOnly ? "default" : "text" }}
                  onClick={() => { if (!isReadOnly) setEditingSubtitle(true); }}
                >
                  {detailDraft.subtitulo || "Sem subtítulo"}
                </div>
              )}
            </div>

            <div style={{ gridColumn: "1 / 3", gridRow: "4" }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Descrição</div>
              {editingDescription ? (
                <Input
                  multiline
                  value={detailDraft.descricao}
                  onChange={(v) => setDetailDraft((prev) => ({ ...prev, descricao: v }))}
                  onBlur={() => setEditingDescription(false)}
                  placeholder="Adicionar descrição"
                  style={{ minHeight: 100 }}
                />
              ) : (
                <div
                  className="text-area-box"
                  style={{ minHeight: 100, cursor: isReadOnly ? "default" : "text" }}
                  onClick={() => { if (!isReadOnly) setEditingDescription(true); }}
                >
                  {detailDraft.descricao || "Sem descrição"}
                </div>
              )}
            </div>
            <div style={{ gridColumn: "1 / 2", gridRow: "5" }}>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Atualizações</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <UpdatesList
                  updates={detailUpdates}
                  currentUserId={isReadOnly ? null : currentUserId}
                  onEdit={isReadOnly ? undefined : async (id, conteudo) => {
                    try {
                      const res = await api.put(`/tickets/${detailTicket.id}/updates/${id}`, { conteudo });
                      setDetailUpdates((prev) => prev.map((u) => (String(u.id) === String(id) ? res.data : u)));
                    } catch (e) {
                      console.error(e);
                      alert("Não foi possível atualizar o comentário.");
                    }
                  }}
                  onDelete={isReadOnly ? undefined : async (id) => {
                    try {
                      await api.delete(`/tickets/${detailTicket.id}/updates/${id}`);
                      setDetailUpdates((prev) => prev.filter((u) => String(u.id) !== String(id)));
                    } catch (e) {
                      console.error(e);
                      alert("Não foi possível excluir o comentário.");
                    }
                  }}
                />
                <UpdateComposer
                  value={newUpdateContent}
                  onChange={setNewUpdateContent}
                  posting={postingUpdate}
                  disabled={isReadOnly}
                  onSubmit={async () => {
                    if (isReadOnly) return;
                    try {
                      setPostingUpdate(true);
                      const res = await api.post(`/tickets/${detailTicket.id}/updates`, { conteudo: String(newUpdateContent).trim() });
                      setDetailUpdates((prev) => [...prev, res.data]);
                      setNewUpdateContent("");
                    } catch (e) {
                      console.error(e);
                      alert("Não foi possível adicionar a atualização.");
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
              <div style={{ fontSize: 12, opacity: 0.7 }}>Código</div>
              <div className="field-box" style={{ fontSize: 14 }}>#{detailTicket?.codigo ?? detailTicket?.id ?? "-"}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Criado em</div>
              <div className="field-box" style={{ fontSize: 14 }}>
                {detailTicket?.created_at
                  ? (() => { const d = new Date(detailTicket.created_at); return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` })()
                  : "-"}
              </div>
            </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Solicitante</div>
                  <Select
                    value={detailTicket.solicitante_id ? String(detailTicket.solicitante_id) : ""}
                    onChange={async (v) => {
                      if (isReadOnly) return;
                      const nextId = v || null;
                      const nextUser = nextId ? users.find((u) => String(u.id) === String(nextId)) : null;
                      setDetailTicket((prev) => (prev ? { ...prev, solicitante_id: nextId, solicitante: nextUser ? { id: nextUser.id, name: nextUser.name } : null } : prev));
                      await api.put(`/tickets/${detailTicket.id}`, { solicitante_id: nextId });
                      setTickets((prev) => prev.map((t) => (
                        t.id === detailTicket.id
                          ? {
                              ...t,
                              solicitante_id: nextId ? Number(nextId) : null,
                              solicitante: nextUser ? { id: nextUser.id, name: nextUser.name } : null,
                            }
                          : t
                      )));
                    }}
                    placeholder="Selecione"
                    options={users.map((u) => ({ value: String(u.id), label: u.name }))}
                    style={{ width: "100%", pointerEvents: isReadOnly ? "none" : undefined, opacity: isReadOnly ? 0.7 : undefined }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Responsável</div>
                  <Select
                    value={detailTicket.responsavel_id ? String(detailTicket.responsavel_id) : ""}
                    onChange={async (v) => {
                      if (isReadOnly) return;
                      const nextId = v || null;
                      const nextUser = nextId ? users.find((u) => String(u.id) === String(nextId)) : null;
                      setDetailTicket((prev) => (prev ? { ...prev, responsavel_id: nextId, responsavel: nextUser ? { id: nextUser.id, name: nextUser.name } : null } : prev));
                      await api.put(`/tickets/${detailTicket.id}`, { responsavel_id: nextId });
                      setTickets((prev) => prev.map((t) => (
                        t.id === detailTicket.id
                          ? {
                              ...t,
                              responsavel_id: nextId ? Number(nextId) : null,
                              responsavel: nextUser ? { id: nextUser.id, name: nextUser.name } : null,
                            }
                          : t
                      )));
                    }}
                    placeholder="Sem responsável"
                    options={users.map((u) => ({ value: String(u.id), label: u.name }))}
                    style={{ width: "100%", pointerEvents: isReadOnly ? "none" : undefined, opacity: isReadOnly ? 0.7 : undefined }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Previsão</div>
                  <DatePicker
                    value={detailTicket.data_prevista ? String(detailTicket.data_prevista).slice(0, 10) : ""}
                    onChange={async (v) => {
                      if (isReadOnly) return;
                      setDetailTicket((prev) => (prev ? { ...prev, data_prevista: v } : prev));
                      try {
                        await api.put(`/tickets/${detailTicket.id}`, { data_prevista: v || null });
                        setTickets((prev) => prev.map((t) => (t.id === detailTicket.id ? { ...t, data_prevista: v || null } : t)));
                      } catch (error) {
                        console.error(error);
                        alert("Não foi possível atualizar a previsão.");
                      }
                    }}
                    disabled={isReadOnly}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Status</div>
                  <Select
                    value={detailTicket.status}
                    onChange={async (v) => {
                      if (isReadOnly) return;
                      await handleChangeStatus(detailTicket.id, v);
                      setDetailTicket((prev) => (prev ? { ...prev, status: v } : prev));
                    }}
                    options={STATUS_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
                    style={{ width: "100%", pointerEvents: isReadOnly ? "none" : undefined, opacity: isReadOnly ? 0.7 : undefined }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Prioridade</div>
                  <Select
                    value={detailTicket.prioridade || "padrao"}
                    onChange={async (v) => {
                      if (isReadOnly) return;
                      try {
                        await api.put(`/tickets/${detailTicket.id}`, { prioridade: v });
                        setDetailTicket((prev) => (prev ? { ...prev, prioridade: v } : prev));
                        setTickets((prev) => prev.map((t) => (t.id === detailTicket.id ? { ...t, prioridade: v } : t)));
                      } catch (error) {
                        alert("Não foi possível atualizar a prioridade.");
                        console.error(error);
                      }
                    }}
                    options={PRIORITY_OPTIONS}
                    style={{ width: "100%", pointerEvents: isReadOnly ? "none" : undefined, opacity: isReadOnly ? 0.7 : undefined }}
                  />
                </div>
              </div>
            </div>

            

            
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default App;
