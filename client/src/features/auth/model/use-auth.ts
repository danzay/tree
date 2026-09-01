import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createGoogleIntent,
  createGoogleLinkIntent,
  createInvitation,
  getAuthConfig,
  getAuthUser,
  login,
  logout,
  register,
} from '../api/auth-api'
import { AUTH_QUERY_KEYS } from './query-keys'

export function useAuthUserQuery() {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.user,
    queryFn: getAuthUser,
    retry: false,
    staleTime: 60_000,
  })
}

export function useAuthenticatedUser() {
  const authQuery = useAuthUserQuery()

  if (authQuery.data === null || authQuery.data === undefined) {
    throw new Error('Authenticated user is unavailable outside AuthBoundary')
  }

  return authQuery.data
}

export function useAuthConfigQuery() {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.config,
    queryFn: getAuthConfig,
    retry: false,
  })
}

export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onSuccess: (user) => queryClient.setQueryData(AUTH_QUERY_KEYS.user, user),
  })
}

export function useRegistrationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: register,
    onSuccess: (user) => queryClient.setQueryData(AUTH_QUERY_KEYS.user, user),
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear()
      queryClient.setQueryData(AUTH_QUERY_KEYS.user, null)
    },
  })
}

export function useGoogleIntentMutation() {
  return useMutation({ mutationFn: createGoogleIntent })
}

export function useGoogleLinkMutation() {
  return useMutation({ mutationFn: createGoogleLinkIntent })
}

export function useInvitationMutation() {
  return useMutation({ mutationFn: createInvitation })
}
