import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  commandPaletteOpen: boolean;
  currentBreadcrumb: { label: string; href?: string }[];
  notifications: Notification[];

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setBreadcrumb: (items: { label: string; href?: string }[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: "meeting" | "action" | "mention" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  commandPaletteOpen: false,
  currentBreadcrumb: [],
  notifications: [],

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleMobileSidebar: () => set((state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen })),
  setMobileSidebarOpen: (open) => set({ sidebarMobileOpen: open }),
  toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setBreadcrumb: (items) => set({ currentBreadcrumb: items }),
  addNotification: (notification) =>
    set((state) => ({ notifications: [notification, ...state.notifications] })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));
