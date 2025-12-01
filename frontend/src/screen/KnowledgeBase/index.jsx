import { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "../../api";
 

export default function KnowledgeBase() {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      const cRes = await api.get("/kb/categories");
      setCategories(cRes.data?.data ?? cRes.data ?? []);
    };
    load();
  }, []);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (categoryId) params.kb_category_id = categoryId;
      const aRes = await api.get("/kb/articles", { params });
      const data = aRes.data?.data ?? aRes.data ?? [];
      setArticles(Array.isArray(data) ? data : data.data ?? []);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }, [q, categoryId]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const filteredCategories = useMemo(() => {
    return categories;
  }, [categories]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
      <div>
        <h2 style={{ margin: 0, marginBottom: 12 }}>Base de conhecimento</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            placeholder="Buscar artigos"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") loadArticles();
            }}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#111827" }}
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#111827" }}
          >
            <option value="">Todas categorias</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          <button
            onClick={loadArticles}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#111827", cursor: "pointer" }}
          >
            Buscar
          </button>
        </div>
      </div>
      <div>
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr" : "1fr", gap: 16 }}>
          {!selected && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(260px, 1fr))", gap: 16 }}>
              {articles.map((a) => (
                <div key={a.id} className="card" style={{ padding: 12, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontWeight: 600 }}>{a.titulo}</div>
                    <button onClick={() => setSelected(a)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#111827", cursor: "pointer" }}>Abrir</button>
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                    {a.categoria?.nome}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                    {a.autor?.name}
                  </div>
                </div>
              ))}
              {!loading && articles.length === 0 ? (
                <div style={{ gridColumn: "1 / 3", color: "#6b7280" }}>Nenhum artigo encontrado para a busca.</div>
              ) : null}
              {loading && <div>Carregando...</div>}
            </div>
          )}
          {selected && (
            <div>
              <button onClick={() => setSelected(null)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#111827", cursor: "pointer", marginBottom: 12 }}>Voltar</button>
              <h2 style={{ marginTop: 0 }}>{selected.titulo}</h2>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
                {selected.categoria?.nome} • {selected.autor?.name}
              </div>
              <div dangerouslySetInnerHTML={{ __html: selected.conteudo }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
