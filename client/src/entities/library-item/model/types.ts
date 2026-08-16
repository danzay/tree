import { LIBRARY_ITEM_COVERS, LIBRARY_ITEM_TYPES } from './consts'

export type LibraryItemType = (typeof LIBRARY_ITEM_TYPES)[number]
export type LibraryItemCover = (typeof LIBRARY_ITEM_COVERS)[number]

export interface LibraryItem {
  id: number
  title: string
  type: LibraryItemType
  detail: string
  state: string
  cover: LibraryItemCover
  vocabularyCount: number
  openedOrder: number
}
