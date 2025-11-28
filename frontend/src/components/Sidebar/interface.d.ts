export interface SidebarItem { key: string; label: string }

export interface SidebarProps {
  items: SidebarItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  user?: { name?: string; email?: string } | null;
  onLogout: () => void;
}

