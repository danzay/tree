import { API_CLIENT } from '@/shared/api/api-client'
import type { ArticleDetail } from '../model/types'

export async function getArticle(id: number, signal?: AbortSignal) {
  const response = await API_CLIENT.get<ArticleDetail>(`/library-items/${id}`, { signal })
  return response.data
}
