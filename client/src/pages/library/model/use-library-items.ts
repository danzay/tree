import { useLibraryItemsQuery } from '@/entities/library-item'
import { useQueryErrorMessage } from '@/shared/api/useQueryErrorMessage'

export function useLibraryItems() {
  const itemsQuery = useLibraryItemsQuery()
  const error = useQueryErrorMessage(itemsQuery, 'library.errors.loading')

  return {
    error,
    items: itemsQuery.data ?? [],
    loading: itemsQuery.isLoading,
  }
}
