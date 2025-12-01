import { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "../../api";
 

export default function KnowledgeBase() {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selected, setSelected] = useState(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [catSaving, setCatSaving] = useState(false);
  const CREATE_VALUE = "__create__";

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
      if (categoryId && categoryId !== CREATE_VALUE) params.kb_category_id = categoryId;
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

  const createCategory = async () => {
    if (!newCatName.trim()) {
      alert("Informe um nome para a categoria.");
      return;
    }
    setCatSaving(true);
    try {
      const res = await api.post('/kb/categories', { nome: newCatName.trim(), descricao: newCatDesc || null });
      const created = res.data?.data ?? res.data;
      setCategories((prev) => Array.isArray(prev) ? [...prev, created] : [created]);
      setNewCatName("");
      setNewCatDesc("");
      setCategoryId(String(created.id));
    } catch (err) {
      let msg = 'Não foi possível criar a categoria.';
      try {
        const data = err?.response?.data;
        if (typeof data === 'string') msg = data;
        else if (data?.message) msg = data.message;
        else if (data?.errors) {
          const first = Object.values(data.errors)[0];
          if (Array.isArray(first) && first.length > 0) msg = String(first[0]);
        }
      } catch { void 0; }
      alert(msg);
    } finally {
      setCatSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ margin: 0 }}>Base de conhecimento</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <input
          placeholder="Buscar artigos"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") loadArticles();
          }}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#111827", minWidth: 260 }}
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#111827" }}
        >
          <option value="">Todas categorias</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={String(c.id)}>{c.nome}</option>
          ))}
          <option value={CREATE_VALUE}>Criar categoria</option>
        </select>
        <button
          onClick={loadArticles}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#111827", cursor: "pointer" }}
        >
          Buscar
        </button>
      </div>

      {categoryId === CREATE_VALUE ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
          <div style={{ fontWeight: 600 }}>Nova categoria</div>
          <input
            placeholder="Nome da categoria"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#111827" }}
          />
          <input
            placeholder="Descrição (opcional)"
            value={newCatDesc}
            onChange={(e) => setNewCatDesc(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#111827" }}
          />
          <button
            onClick={createCategory}
            disabled={catSaving || !newCatName.trim()}
            style={{ padding: 8, borderRadius: 6, border: "none", background: catSaving || !newCatName.trim() ? "#999" : "#2563eb", color: "#fff", cursor: catSaving || !newCatName.trim() ? "default" : "pointer", fontWeight: 600 }}
          >
            Criar categoria
          </button>
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {!selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
              <div style={{ color: "#6b7280" }}>Nenhum artigo encontrado para a busca.</div>
            ) : null}
            {loading && <div>Carregando...</div>}
          </div>
        )}

        {selected && (
          <div className="card" style={{ padding: 12, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }}>
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
  );
}
