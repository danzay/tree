import { API_CLIENT } from '@/shared/api/api-client'
import type { LibraryItem } from '../model/types'

export async function getLibraryItems(signal?: AbortSignal) {
  const response = await API_CLIENT.get<LibraryItem[]>('/library-items', { signal })
  return response.data
}
