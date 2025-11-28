export interface UpdateItem {
  id: number | string;
  user?: { id: number | string; name: string } | null;
  created_at?: string | null;
  conteudo: string;
}

export interface UpdatesListProps {
  updates: UpdateItem[];
  currentUserId?: number | string | null;
  onEdit?: (id: number | string, conteudo: string) => void | Promise<void>;
  onDelete?: (id: number | string) => void | Promise<void>;
}
