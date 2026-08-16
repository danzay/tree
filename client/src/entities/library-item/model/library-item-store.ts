import { z } from 'zod'
import { create } from 'zustand'
import { LIBRARY_ITEM_COVERS, LIBRARY_ITEM_TYPES } from './consts'
import { DEFAULT_LIBRARY_ITEMS } from './default-library-items'
import type { LibraryItem } from './types'

export const LIBRARY_ITEMS_STORAGE_KEY = 'tree.library-items.v1'
const LEGACY_LIBRARY_ITEMS_STORAGE_KEY = 'tree.materials.v1'

const LIBRARY_ITEM_SCHEMA = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1),
  type: z.enum(LIBRARY_ITEM_TYPES),
  detail: z.string(),
  state: z.string(),
  cover: z.enum(LIBRARY_ITEM_COVERS),
  vocabularyCount: z.number().int().nonnegative(),
  openedOrder: z.number().int().nonnegative(),
})

const STORED_LIBRARY_ITEMS_SCHEMA = z.object({
  version: z.literal(1),
  items: z.array(LIBRARY_ITEM_SCHEMA),
})

const LEGACY_STORED_LIBRARY_ITEMS_SCHEMA = z.object({
  version: z.literal(1),
  materials: z.array(LIBRARY_ITEM_SCHEMA),
})

function cloneDefaults(): LibraryItem[] {
  return DEFAULT_LIBRARY_ITEMS.map((item) => ({ ...item }))
}

function saveLibraryItems(items: LibraryItem[]) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(LIBRARY_ITEMS_STORAGE_KEY, JSON.stringify({ version: 1, items }))
  } catch {
    // The in-memory store remains usable if storage is unavailable or full.
  }
}

function loadLibraryItems(): LibraryItem[] {
  if (typeof window === 'undefined') {
    return cloneDefaults()
  }

  try {
    const storedValue = window.localStorage.getItem(LIBRARY_ITEMS_STORAGE_KEY)
    if (storedValue) {
      const parsed = STORED_LIBRARY_ITEMS_SCHEMA.safeParse(JSON.parse(storedValue))
      if (parsed.success) {
        return parsed.data.items
      }
    }

    const legacyValue = window.localStorage.getItem(LEGACY_LIBRARY_ITEMS_STORAGE_KEY)
    if (legacyValue) {
      const parsed = LEGACY_STORED_LIBRARY_ITEMS_SCHEMA.safeParse(JSON.parse(legacyValue))
      if (parsed.success) {
        saveLibraryItems(parsed.data.materials)
        return parsed.data.materials
      }
    }
  } catch {
    // Invalid or unavailable storage is replaced with the safe defaults below.
  }

  const defaults = cloneDefaults()
  saveLibraryItems(defaults)
  return defaults
}

interface LibraryItemStore {
  items: LibraryItem[]
  addItem: (item: LibraryItem) => void
  updateItem: (id: number, changes: Partial<Omit<LibraryItem, 'id'>>) => void
  removeItem: (id: number) => void
  replaceItems: (items: LibraryItem[]) => void
  resetItems: () => void
}

export const useLibraryItemStore = create<LibraryItemStore>((set) => {
  const commit = (items: LibraryItem[]) => {
    saveLibraryItems(items)
    set({ items })
  }

  return {
    items: loadLibraryItems(),
    addItem: (item) =>
      set((state) => {
        const items = [...state.items, item]
        saveLibraryItems(items)
        return { items }
      }),
    updateItem: (id, changes) =>
      set((state) => {
        const items = state.items.map((item) => (item.id === id ? { ...item, ...changes } : item))
        saveLibraryItems(items)
        return { items }
      }),
    removeItem: (id) =>
      set((state) => {
        const items = state.items.filter((item) => item.id !== id)
        saveLibraryItems(items)
        return { items }
      }),
    replaceItems: commit,
    resetItems: () => commit(cloneDefaults()),
  }
})
