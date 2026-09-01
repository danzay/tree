import axios from 'axios'
import { API_CLIENT } from '@/shared/api/api-client'
import type {
  AuthConfig,
  AuthUser,
  GoogleIntent,
  Invitation,
  LoginCredentials,
  RegistrationDetails,
} from '../model/types'

async function ensureCsrfToken() {
  await API_CLIENT.get('/auth/csrf')
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const response = await API_CLIENT.get<AuthUser>('/auth/me')

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null
    }

    throw error
  }
}

export async function getAuthConfig() {
  const response = await API_CLIENT.get<AuthConfig>('/auth/config')

  return response.data
}

export async function login(credentials: LoginCredentials) {
  await ensureCsrfToken()
  const response = await API_CLIENT.post<AuthUser>('/auth/login', credentials)

  return response.data
}

export async function register(details: RegistrationDetails) {
  await ensureCsrfToken()
  const response = await API_CLIENT.post<AuthUser>('/auth/register', details)

  return response.data
}

export async function logout() {
  await ensureCsrfToken()
  await API_CLIENT.post('/auth/logout')
}

export async function createGoogleIntent(invitationToken?: string) {
  await ensureCsrfToken()
  const response = await API_CLIENT.post<GoogleIntent>('/auth/google/intent', {
    invitationToken,
  })

  return response.data
}

export async function createGoogleLinkIntent() {
  await ensureCsrfToken()
  const response = await API_CLIENT.post<GoogleIntent>('/auth/google/link-intent')

  return response.data
}

export async function createInvitation(email: string) {
  await ensureCsrfToken()
  const response = await API_CLIENT.post<Invitation>('/auth/invitations', { email })

  return response.data
}
