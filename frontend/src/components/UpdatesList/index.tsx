import { listWrapperStyle, listItemStyle, listHeaderStyle, actionRowStyle, plainButtonStyle, dangerButtonStyle } from "./style";
import type { UpdatesListProps } from "./interface";
import { theme } from "../../theme";
import Input from "../Input";
import PrimaryButton from "../PrimaryButton";
import { useState } from "react";

export default function UpdatesList({ updates, currentUserId, onEdit, onDelete }: UpdatesListProps) {
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [draft, setDraft] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const startEdit = (id: number | string, initial: string) => {
    setEditingId(id);
    setDraft(initial);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setDraft("");
  };

  const saveEdit = async () => {
    if (!onEdit || editingId == null) return;
    setSaving(true);
    try {
      await onEdit(editingId, draft);
      cancelEdit();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-scroll" style={listWrapperStyle}>
      {(!updates || updates.length === 0) ? (
        <div style={{ fontSize: 13, color: "#666" }}>Ainda não há atualizações.</div>
      ) : (
        updates.map((u) => (
          <div key={u.id} style={listItemStyle}>
            <div style={listHeaderStyle}>
              <span>{u.user?.name ?? "Usuário"}</span>
              <span>{u.created_at ? new Date(u.created_at).toLocaleString("pt-BR") : ""}</span>
            </div>
            {editingId === u.id ? (
              <div>
                <Input multiline value={draft} onChange={setDraft} style={{ width: "100%" }} />
                <div style={actionRowStyle}>
                  <PrimaryButton disabled={saving || !String(draft).trim()} onClick={saveEdit}>
                    {saving ? "Salvando..." : "Salvar"}
                  </PrimaryButton>
                  <button onClick={cancelEdit} style={plainButtonStyle}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ whiteSpace: "pre-wrap" }}>{u.conteudo}</div>
                {currentUserId != null && String(u.user?.id ?? "") === String(currentUserId) ? (
                  <div style={actionRowStyle}>
                    <button
                      onClick={() => startEdit(u.id, u.conteudo)}
                      style={plainButtonStyle}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (!onDelete) return;
                        const ok = window.confirm("Excluir este comentário?");
                        if (ok) onDelete(u.id);
                      }}
                      style={dangerButtonStyle}
                    >
                      Excluir
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
