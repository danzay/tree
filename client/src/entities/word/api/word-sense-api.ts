import { API_CLIENT } from '@/shared/api/api-client'
import type { StatsResponse, VocabularySense, WordsResponse, WordSenseQuery } from '../model/types'

export async function getVocabularyStats(signal?: AbortSignal) {
  const response = await API_CLIENT.get<StatsResponse>('/stats', { signal })

  return response.data
}

export async function getWordSenses(query: WordSenseQuery, signal?: AbortSignal) {
  const response = await API_CLIENT.get<WordsResponse>('/words', {
    signal,
    params: {
      q: query.search?.trim() || undefined,
      level: query.level || undefined,
      status: query.status || undefined,
      language: query.language ?? 'ru',
      limit: query.limit ?? 30,
      offset: query.offset ?? 0,
    },
  })

  return response.data
}

export async function getWordSense(id: number, signal?: AbortSignal) {
  const response = await API_CLIENT.get<VocabularySense>(`/words/${id}`, {
    signal,
    params: { language: 'ru' },
  })

  return response.data
}
