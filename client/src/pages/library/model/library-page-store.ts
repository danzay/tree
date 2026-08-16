import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LIBRARY_PAGE_STORAGE_KEY } from './consts'

export type LibraryViewMode = 'grid' | 'list'

interface LibraryPageState {
  viewMode: LibraryViewMode
  setViewMode: (viewMode: LibraryViewMode) => void
}

export const useLibraryPageStore = create<LibraryPageState>()(
  persist(
    (set) => ({
      viewMode: 'grid',
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    { name: LIBRARY_PAGE_STORAGE_KEY },
  ),
)
