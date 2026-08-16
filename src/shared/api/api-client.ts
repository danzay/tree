import axios from 'axios'

export const API_CLIENT = axios.create({
  baseURL: '/api',
  headers: {
    Accept: 'application/json',
  },
  timeout: 10_000,
})

export function isRequestCanceled(error: unknown) {
  return axios.isCancel(error)
}

export function getRequestErrorMessage(
  error: unknown,
  fallback: string,
  connectionFallback: string,
) {
  const isAxiosError = axios.isAxiosError(error)
  const isNetworkError = isAxiosError && error.code === 'ERR_NETWORK'

  if (isNetworkError) {
    return connectionFallback
  }

  const isErrorWithMessage = error instanceof Error && Boolean(error.message)
  if (isErrorWithMessage) {
    return error.message
  }

  return fallback
}
