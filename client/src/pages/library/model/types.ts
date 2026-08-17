import type { LibraryItemType } from '@/entities/library-item'

export type LibraryFilter = 'all' | LibraryItemType
export type LibrarySort = 'recent' | 'title' | 'type'
