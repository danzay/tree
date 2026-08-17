import {
  ALL_LIBRARY_ITEMS_FILTER,
  RECENT_LIBRARY_ITEM_SORT,
  TITLE_LIBRARY_ITEM_SORT,
  TYPE_LIBRARY_ITEM_SORT,
} from '../../model/consts'
import type { LibraryViewMode } from '../../model/library-page-store'
import type { LibraryFilter, LibrarySort } from '../../model/types'

export const FILTER_OPTIONS: Array<{ value: LibraryFilter; translationKey: string }> = [
  { value: ALL_LIBRARY_ITEMS_FILTER, translationKey: 'library.filters.all' },
  { value: 'article', translationKey: 'library.filters.articles' },
  { value: 'story', translationKey: 'library.filters.stories' },
  { value: 'video', translationKey: 'library.filters.videos' },
  { value: 'podcast', translationKey: 'library.filters.podcasts' },
  { value: 'note', translationKey: 'library.filters.notes' },
]

export const SORT_OPTIONS: Array<{ value: LibrarySort; translationKey: string }> = [
  { value: RECENT_LIBRARY_ITEM_SORT, translationKey: 'library.sort.recent' },
  { value: TITLE_LIBRARY_ITEM_SORT, translationKey: 'library.sort.title' },
  { value: TYPE_LIBRARY_ITEM_SORT, translationKey: 'library.sort.type' },
]

export const VIEW_VALUES: LibraryViewMode[] = ['grid', 'list']
