import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components/Button'
import { AuthErrorMessage, useGoogleLinkMutation } from '@/features/auth'
import styles from './GoogleConnection.module.scss'

interface GoogleConnectionProps {
  linked: boolean
}

export function GoogleConnection({ linked }: GoogleConnectionProps) {
  const { t } = useTranslation()
  const googleMutation = useGoogleLinkMutation()
  const googleStatusKey = linked
    ? 'account.security.googleLinked'
    : 'account.security.googleNotLinked'
  const showLinkButton = !linked
  const googleError = googleMutation.error

  const handleGoogleLink = () => {
    googleMutation.mutate(undefined, {
      onSuccess: ({ authorizationPath }) => window.location.assign(authorizationPath),
    })
  }

  return (
    <>
      <div className={styles.row}>
        <div>
          <strong>{t('account.security.google')}</strong>
          <p>{t(googleStatusKey)}</p>
        </div>
        {showLinkButton && (
          <Button className={styles.button} onPress={handleGoogleLink}>
            {t('account.actions.linkGoogle')}
          </Button>
        )}
      </div>
      {googleError && (
        <AuthErrorMessage
          className={styles.error}
          error={googleError}
          fallbackKey="auth.errors.google"
        />
      )}
    </>
  )
}
