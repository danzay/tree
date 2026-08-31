import { QueryClient } from '@tanstack/react-query'
import { QUERY_RETRY_COUNT, QUERY_STALE_TIME_MS } from './consts'

export const QUERY_CLIENT = new QueryClient({
  defaultOptions: {
    queries: {
      retry: QUERY_RETRY_COUNT,
      staleTime: QUERY_STALE_TIME_MS,
    },
  },
})
