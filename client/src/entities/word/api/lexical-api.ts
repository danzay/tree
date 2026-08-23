import axios from 'axios'
import { API_CLIENT } from '@/shared/api/api-client'
import type { DictionaryApiEntry } from './dictionary-api-types'
import { mapDictionaryEntry } from './utils/mapDictionaryEntry'
import type { TranslationResponse } from '../model/lexical-types'

const DICTIONARY_API_CLIENT = axios.create({
  baseURL: 'https://api.dictionaryapi.dev/api/v2/entries/en',
  headers: {
    Accept: 'application/json',
  },
  timeout: 10_000,
})

export async function getDictionaryEntries(term: string, signal?: AbortSignal) {
  try {
    const response = await DICTIONARY_API_CLIENT.get<DictionaryApiEntry[]>(
      `/${encodeURIComponent(term)}`,
      { signal },
    )

    return response.data.map(mapDictionaryEntry)
  } catch (caught: unknown) {
    const isMissingEntry = axios.isAxiosError(caught) && caught.response?.status === 404

    if (isMissingEntry) {
      return []
    }

    throw caught
  }
}

export async function getTranslations(text: string, signal?: AbortSignal) {
  const response = await API_CLIENT.get<TranslationResponse>('/translations', {
    signal,
    params: { text },
  })

  return response.data
}
