import { useQuery } from '@tanstack/react-query'
import { getLibraryItems } from '../api/library-item-api'
import { LIBRARY_ITEM_QUERY_KEYS } from './query-keys'

export function useLibraryItemsQuery() {
  return useQuery({
    queryKey: LIBRARY_ITEM_QUERY_KEYS.list,
    queryFn: ({ signal }) => getLibraryItems(signal),
  })
}
