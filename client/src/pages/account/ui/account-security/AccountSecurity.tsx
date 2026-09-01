import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components/Button'
import { useNavigate } from 'react-router'
import { AuthErrorMessage, useLogoutMutation, type AuthUser } from '@/features/auth'
import { APP_ROUTE_PATHS } from '@/app/route-consts'
import { GoogleConnection } from '../google-connection/GoogleConnection'
import styles from './AccountSecurity.module.scss'

interface AccountSecurityProps {
  user: AuthUser
  googleEnabled: boolean
}

export function AccountSecurity({ user, googleEnabled }: AccountSecurityProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logoutMutation = useLogoutMutation()
  const googleLinked = user.googleLinked
  const logoutPending = logoutMutation.isPending
  const logoutError = logoutMutation.error

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate(APP_ROUTE_PATHS.LOGIN, { replace: true }),
    })
  }

  return (
    <section className={styles.card}>
      <div>
        <p className={styles.eyebrow}>{t('account.security.eyebrow')}</p>
        <h2>{t('account.security.title')}</h2>
      </div>
      {googleEnabled && <GoogleConnection linked={googleLinked} />}
      <div className={styles.row}>
        <div>
          <strong>{t('account.security.session')}</strong>
          <p>{t('account.security.sessionDescription')}</p>
        </div>
        <Button className={styles.danger} onPress={handleLogout} isDisabled={logoutPending}>
          {t('account.actions.signOut')}
        </Button>
      </div>
      {logoutError && (
        <AuthErrorMessage
          className={styles.error}
          error={logoutError}
          fallbackKey="auth.errors.logout"
        />
      )}
    </section>
  )
}
