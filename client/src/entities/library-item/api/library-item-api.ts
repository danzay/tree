import { API_CLIENT } from '@/shared/api/api-client'
import type { LibraryItem, LibraryItemDetail } from '../model/types'

export async function getLibraryItems(signal?: AbortSignal) {
  const response = await API_CLIENT.get<LibraryItem[]>('/library-items', { signal })
  return response.data
}

export async function getLibraryItem(id: number, signal?: AbortSignal) {
  const response = await API_CLIENT.get<LibraryItemDetail>(`/library-items/${id}`, { signal })
  return response.data
}
