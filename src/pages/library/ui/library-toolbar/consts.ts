import {
  ALL_LIBRARY_ITEMS_FILTER,
  RECENT_LIBRARY_ITEM_SORT,
  STORIES_FILTER,
  TITLE_LIBRARY_ITEM_SORT,
  TYPE_LIBRARY_ITEM_SORT,
} from '../../model/consts'
import type { LibraryViewMode } from '../../model/library-page-store'
import type { LibraryFilter, LibrarySort } from '../../model/types'

export const FILTER_OPTIONS: Array<{ value: LibraryFilter; translationKey: string }> = [
  { value: ALL_LIBRARY_ITEMS_FILTER, translationKey: 'library.filters.all' },
  { value: 'Articles', translationKey: 'library.filters.articles' },
  { value: STORIES_FILTER, translationKey: 'library.filters.stories' },
  { value: 'Videos', translationKey: 'library.filters.videos' },
  { value: 'Podcasts', translationKey: 'library.filters.podcasts' },
  { value: 'Notes', translationKey: 'library.filters.notes' },
]

export const SORT_OPTIONS: Array<{ value: LibrarySort; translationKey: string }> = [
  { value: RECENT_LIBRARY_ITEM_SORT, translationKey: 'library.sort.recent' },
  { value: TITLE_LIBRARY_ITEM_SORT, translationKey: 'library.sort.title' },
  { value: TYPE_LIBRARY_ITEM_SORT, translationKey: 'library.sort.type' },
]

export const VIEW_VALUES: LibraryViewMode[] = ['grid', 'list']
