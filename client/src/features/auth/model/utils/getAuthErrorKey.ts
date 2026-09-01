import axios from 'axios'

const AUTH_ERROR_CODES = new Set([
  'account_already_exists',
  'access_denied',
  'google_account_link_required',
  'google_email_not_verified',
  'google_identity_already_linked',
  'google_login_unavailable',
  'invalid_credentials',
  'invalid_invitation',
  'invitation_required',
  'rate_limit_exceeded',
])

interface ErrorResponse {
  error?: string
}

export function getAuthErrorKey(error: unknown, fallbackKey: string) {
  if (!axios.isAxiosError<ErrorResponse>(error)) {
    return fallbackKey
  }

  const code = error.response?.data.error

  return code !== undefined && AUTH_ERROR_CODES.has(code) ? `auth.errors.${code}` : fallbackKey
}
