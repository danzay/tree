import type { AuthMode } from '../../model/types'
import { LoginForm } from '../login-form/LoginForm'
import { RegistrationForm } from '../registration-form/RegistrationForm'

interface AuthFormProps {
  mode: AuthMode
  invitationToken: string
}

export function AuthForm({ mode, invitationToken }: AuthFormProps) {
  if (mode === 'login') {
    return <LoginForm />
  }

  return <RegistrationForm invitationToken={invitationToken} />
}
