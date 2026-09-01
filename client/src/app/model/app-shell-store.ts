import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { APP_SHELL_STORAGE_KEY } from './consts'

interface AppShellState {
  sidebarExpanded: boolean
  toggleSidebar: () => void
}

export const useAppShellStore = create<AppShellState>()(
  persist(
    (set) => ({
      sidebarExpanded: true,
      toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
    }),
    { name: APP_SHELL_STORAGE_KEY },
  ),
)
