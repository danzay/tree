import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useSearchParams } from 'react-router'
import { useAuthConfigQuery, useAuthUserQuery } from '@/features/auth'
import { APP_ROUTE_PATHS } from '@/app/route-consts'
import { SegmentedControl } from '@/shared/ui'
import type { AuthMode } from '../../model/types'
import { AuthForm } from '../auth-form/AuthForm'
import { GoogleAuthButton } from '../google-auth-button/GoogleAuthButton'
import styles from './LoginPage.module.scss'

export function LoginPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const invitationToken = searchParams.get('invite') ?? ''
  const initialMode =
    searchParams.get('mode') === 'register' || invitationToken !== '' ? 'register' : 'login'
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const authQuery = useAuthUserQuery()
  const configQuery = useAuthConfigQuery()
  const oauthFailed = searchParams.get('oauth') === 'failed'
  const googleEnabled = configQuery.data?.googleEnabled === true
  const options = [
    { value: 'login' as AuthMode, label: t('auth.tabs.login') },
    { value: 'register' as AuthMode, label: t('auth.tabs.register') },
  ]

  if (authQuery.data !== null && authQuery.data !== undefined) {
    return <Navigate to={APP_ROUTE_PATHS.DICTIONARY} replace />
  }

  return (
    <main className={styles.page}>
      <div className={styles.decoration} aria-hidden="true" />
      <div className={styles.layout}>
        <div className={styles.formColumn}>
          <section className={styles.card} aria-labelledby="auth-title">
            <SegmentedControl<AuthMode>
              className={styles.tabs}
              itemClassName={styles.tab}
              value={mode}
              options={options}
              ariaLabel={t('auth.tabs.label')}
              onValueChange={setMode}
            />
            {oauthFailed && (
              <p className={styles.oauthError} role="alert">
                {t('auth.errors.google')}
              </p>
            )}
            <AuthForm mode={mode} invitationToken={invitationToken} />
            <GoogleAuthButton enabled={googleEnabled} invitationToken={invitationToken} />
          </section>
          <p className={styles.note}>{t('auth.privateNote')}</p>
        </div>
      </div>
    </main>
  )
}
