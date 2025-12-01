export interface SidebarItem { key: string; label: string; children?: SidebarItem[] }

export interface SidebarProps {
  items: SidebarItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  user?: { name?: string; email?: string } | null;
  onLogout: () => void;
  onCreateProject?: () => void;
  canCreateProject?: boolean;
  onRenameProject?: (projectKey: string) => void;
  onDeleteProject?: (projectKey: string) => void;
  userList?: { id: number; name: string; email: string }[];
  onLinkMember?: (projectKey: string, payload: { id?: number; email?: string }) => void;
}
