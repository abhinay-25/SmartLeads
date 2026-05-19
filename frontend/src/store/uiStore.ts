import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ──────────────────────────────────────────────────────
// UI Store — sidebar, theme, notifications
// ──────────────────────────────────────────────────────

interface UIState {
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      isSidebarCollapsed: false,
      isMobileSidebarOpen: false,
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      toggleMobileSidebar: () =>
        set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
      closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
    }),
    { name: 'ui-store' }
  )
);
