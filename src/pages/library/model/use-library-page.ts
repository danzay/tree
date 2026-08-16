import { useMemo, useState } from 'react'
import type { LibraryItem, LibraryItemType } from '@/entities/library-item'
import {
  ALL_LIBRARY_ITEMS_FILTER,
  RECENT_LIBRARY_ITEM_SORT,
  STORIES_FILTER,
  TITLE_LIBRARY_ITEM_SORT,
  TYPE_LIBRARY_ITEM_SORT,
} from './consts'
import type { LibraryFilter, LibrarySort } from './types'

function singularFilter(filter: LibraryFilter): LibraryItemType | null {
  if (filter === ALL_LIBRARY_ITEMS_FILTER) {
    return null
  }

  if (filter === STORIES_FILTER) {
    return 'Story'
  }

  return filter.slice(0, -1) as LibraryItemType
}

export function useLibraryPage(items: LibraryItem[]) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<LibraryFilter>(ALL_LIBRARY_ITEMS_FILTER)
  const [sort, setSort] = useState<LibrarySort>(RECENT_LIBRARY_ITEM_SORT)

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    const type = singularFilter(filter)
    const filtered = items.filter((item) => {
      const matchesType = !type || item.type === type
      const hasEmptyQuery = normalizedQuery.length === 0
      const normalizedTitle = item.title.toLocaleLowerCase()
      const normalizedType = item.type.toLocaleLowerCase()
      const matchesTitle = normalizedTitle.includes(normalizedQuery)
      const matchesLibraryItemType = normalizedType.includes(normalizedQuery)
      const matchesQuery = hasEmptyQuery || matchesTitle || matchesLibraryItemType
      return matchesType && matchesQuery
    })

    return [...filtered].sort((first, second) => {
      if (sort === TITLE_LIBRARY_ITEM_SORT) {
        return first.title.localeCompare(second.title)
      }

      if (sort === TYPE_LIBRARY_ITEM_SORT) {
        const typeComparison = first.type.localeCompare(second.type)
        if (typeComparison !== 0) {
          return typeComparison
        }

        return first.title.localeCompare(second.title)
      }

      return first.openedOrder - second.openedOrder
    })
  }, [filter, items, query, sort])

  const vocabularyTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.vocabularyCount, 0),
    [items],
  )

  return {
    filter,
    itemsTotal: items.length,
    query,
    setFilter,
    setQuery,
    setSort,
    sort,
    visibleItems,
    vocabularyTotal,
  }
}
