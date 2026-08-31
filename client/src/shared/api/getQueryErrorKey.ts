import axios from 'axios'
import { QUERY_CONNECTION_ERROR_KEY } from './consts'
import type { QueryErrorState } from './types'

export function getQueryErrorKey(query: QueryErrorState, fallbackKey: string) {
  if (!query.isError) {
    return null
  }

  const isNetworkError = axios.isAxiosError(query.error) && query.error.code === 'ERR_NETWORK'

  return isNetworkError ? QUERY_CONNECTION_ERROR_KEY : fallbackKey
}
