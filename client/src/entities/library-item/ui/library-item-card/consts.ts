import type { LibraryItemReadingStatus, LibraryItemType } from '../../model/types'

export const LIBRARY_ITEM_TYPE_TRANSLATION_KEYS: Record<LibraryItemType, string> = {
  article: 'libraryItem.type.article',
  story: 'libraryItem.type.story',
  video: 'libraryItem.type.video',
  podcast: 'libraryItem.type.podcast',
  note: 'libraryItem.type.note',
}

export const LIBRARY_ITEM_STATUS_TRANSLATION_KEYS: Record<LibraryItemReadingStatus, string> = {
  not_started: 'libraryItem.status.notStarted',
  in_progress: 'libraryItem.status.inProgress',
  completed: 'libraryItem.status.completed',
}

export const LIBRARY_ITEM_MENU_ICON = '⋮'
