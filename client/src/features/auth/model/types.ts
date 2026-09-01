export interface AuthUser {
  id: string
  email: string
  displayName: string
  canManageInvitations: boolean
  googleLinked: boolean
}

export interface AuthConfig {
  googleEnabled: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegistrationDetails extends LoginCredentials {
  displayName: string
  invitationToken: string
}

export interface Invitation {
  email: string
  token: string
  expiresAt: string
}

export interface GoogleIntent {
  authorizationPath: string
}
