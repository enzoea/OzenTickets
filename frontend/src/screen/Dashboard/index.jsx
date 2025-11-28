import { useEffect, useRef, useState } from "react";
import { api } from "../../api";
import { Pie, Bar } from "react-chartjs-2";
import { theme } from "../../theme";
import Select from "../../components/Select";
import DatePicker from "../../components/DatePicker";
import TicketDetailModal from "../../components/TicketDetailModal";
import { formatDate } from "../Home/utils/format";
import { colorForStatus } from "./utils/status";

import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

// Registrar plugins do Chart.js
Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketOrder, setTicketOrder] = useState("newest");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [detailTicket, setDetailTicket] = useState(null);
  const onTicketPatched = (id, patch) => {
    setTickets((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [draftSelectedUserIds, setDraftSelectedUserIds] = useState([]);
  const filterContainerRef = useRef(null);
  const filterContentRef = useRef(null);

  
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateCreatedFrom, setDateCreatedFrom] = useState("");
  const [dateCreatedTo, setDateCreatedTo] = useState("");
  

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tRes, uRes] = await Promise.allSettled([
          api.get("/tickets"),
          api.get("/user-list"),
        ]);
        if (tRes.status === "fulfilled") setTickets(tRes.value.data);
        if (uRes.status === "fulfilled") setUsers(uRes.value.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        let u = null;
        try { u = JSON.parse(userStr); } catch (e) { void e; u = null; }
        if (u?.id) setCurrentUserId(String(u.id));
      }
    } catch (e) { void e; }
  }, []);

  

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

  // filtros aplicados
  const filteredTickets = tickets
    .filter((t) =>
      selectedUserIds.length === 0
        ? true
        : ((selectedUserIds.includes("__none__") ? t.responsavel_id == null : false) || selectedUserIds.includes(String(t.responsavel_id)))
    )
    .filter((t) => {
      const usePrev = Boolean(dateFrom || dateTo);
      const useCreated = Boolean(dateCreatedFrom || dateCreatedTo);
      const okPrev = inDateRange(t.data_prevista, dateFrom, dateTo);
      const okCreated = inDateRange(t.created_at, dateCreatedFrom, dateCreatedTo);
      return (usePrev ? okPrev : true) && (useCreated ? okCreated : true);
    });

  const byStatus = Object.values(
    filteredTickets.reduce((acc, t) => {
      const key = t.status || "(sem status)";
      acc[key] = acc[key] || { status: key, total: 0 };
      acc[key].total += 1;
      return acc;
    }, {})
  );

  const byUser = Object.values(
    filteredTickets.reduce((acc, t) => {
      const key = t.responsavel_id == null ? "__none__" : String(t.responsavel_id);
      const name = t.responsavel?.name ?? "Sem responsável";
      acc[key] = acc[key] || { user_id: key, name, total: 0 };
      acc[key].total += 1;
      return acc;
    }, {})
  );

  const bySolicitante = Object.values(
    filteredTickets.reduce((acc, t) => {
      const key = t.solicitante_id == null ? "__none__" : String(t.solicitante_id);
      const name = t.solicitante?.name ?? "(não informado)";
      acc[key] = acc[key] || { user_id: key, name, total: 0 };
      acc[key].total += 1;
      return acc;
    }, {})
  );

  const hasFilters = selectedUserIds.length > 0 || Boolean(dateFrom) || Boolean(dateTo) || Boolean(dateCreatedFrom) || Boolean(dateCreatedTo);

  

  const pieData = {
    labels: byUser.map((u) => u.name),
    datasets: [
      {
        data: byUser.map((u) => u.total),
        backgroundColor: byUser.map((_, i) => theme.palettes.blue[i % theme.palettes.blue.length]),
      },
    ],
  };

  const pieSolicitanteData = {
    labels: bySolicitante.map((u) => u.name),
    datasets: [
      {
        data: bySolicitante.map((u) => u.total),
        backgroundColor: bySolicitante.map((_, i) => theme.palettes.blue[i % theme.palettes.blue.length]),
      },
    ],
  };

  const barData = {
    labels: byStatus.map((s) => s.status),
    datasets: [
      {
        label: "Tickets",
        data: byStatus.map((s) => s.total),
        backgroundColor: byStatus.map((s) => colorForStatus(s.status, "bar", theme)),
      },
    ],
  };

  const pieStatusData = {
    labels: byStatus.map((s) => s.status),
    datasets: [
      {
        data: byStatus.map((s) => s.total),
        backgroundColor: byStatus.map((s) => colorForStatus(s.status, "pie", theme)),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: { enabled: true },
    },
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
    <div style={{ padding: 0 }}>
      <div ref={filterContainerRef} style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
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
      <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
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
        disabled={!hasFilters}
        style={{
          padding: "6px 10px",
          borderRadius: theme.radius.sm,
          border: `1px solid ${theme.colors.border}`,
          background: theme.colors.white,
          color: theme.colors.text,
          cursor: hasFilters ? "pointer" : "default",
          opacity: hasFilters ? 1 : 0.6,
        }}
      >
        Limpar filtros
      </button>
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

      <div className={loading ? "blur-loading" : ""} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: theme.spacing.lg, marginTop: theme.spacing.md, alignItems: "start" }}>
        <div style={{ width: "100%", height: 280 }}>
          <h3>Tickets por responsável</h3>
          <Pie data={pieData} options={chartOptions} />
        </div>

        <div style={{ width: "100%", height: 280 }}>
          <h3>Tickets por solicitante</h3>
          <Pie data={pieSolicitanteData} options={chartOptions} />
        </div>

        <div style={{ width: "100%", height: 300 }}>
          <h3>Tickets por status</h3>
          <Bar data={barData} options={chartOptions} />
        </div>

        <div style={{ width: "100%", height: 280 }}>
          <h3>Distribuição por status</h3>
          <Pie data={pieStatusData} options={chartOptions} />
        </div>
      </div>
      <div style={{ marginTop: theme.spacing.lg }}>
        <div style={{ paddingTop: 50,display: "flex", alignItems: "center", justifyContent: "space-between", gap: theme.spacing.sm }}>
          <h3>Todos os tickets</h3>
          <div style={{ minWidth: 220, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <p>Ordenação</p>
            <Select
              value={ticketOrder}
              onChange={setTicketOrder}
              options={[
                { value: "newest", label: "Data fim: mais recente" },
                { value: "oldest", label: "Data fim: mais antiga" },
              ]}
            />
          </div>
        </div>
        {(() => {
          const list = Array.isArray(tickets) ? tickets.slice() : [];
          const parseDue = (s) => {
            if (!s) return null;
            const str = String(s).slice(0, 10);
            const d = /^\d{4}-\d{2}-\d{2}$/.test(str) ? new Date(`${str}T00:00:00`) : new Date(s);
            const t = d.getTime();
            return Number.isNaN(t) ? null : t;
          };
          list.sort((a, b) => {
            const at = parseDue(a?.data_prevista);
            const bt = parseDue(b?.data_prevista);
            if (at == null && bt == null) return 0;
            if (at == null) return 1;
            if (bt == null) return -1;
            return ticketOrder === "newest" ? bt - at : at - bt;
          });
          return (
            <div style={{ marginTop: theme.spacing.sm, display: "flex", flexDirection: "column", gap: 8, maxHeight: "50vh", overflowY: "auto" }}>
              {list.length === 0 ? (
                <div style={{ fontSize: 13, color: "#666" }}>Nenhum ticket encontrado.</div>
              ) : (
                list.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setDetailTicket(t)}
                    style={{ background: theme.colors.white, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm, padding: 8, cursor: "pointer" }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.titulo}</div>
                    <div style={{ fontSize: 13 }}>
                      <b>Data fim:</b> {formatDate(t.data_prevista)}
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })()}
      </div>
      <TicketDetailModal
        open={Boolean(detailTicket)}
        ticket={detailTicket}
        users={users}
        currentUserId={currentUserId}
        onClose={() => setDetailTicket(null)}
        onTicketPatched={onTicketPatched}
      />
      {loading && <p style={{ marginTop: 12 }}>Carregando métricas...</p>}
    </div>
  );
}
