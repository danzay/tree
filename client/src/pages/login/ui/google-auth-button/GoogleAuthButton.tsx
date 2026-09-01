import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components/Button'
import googleIcon from '@/assets/login/google-icon.webp'
import { AuthErrorMessage, useGoogleIntentMutation } from '@/features/auth'
import styles from './GoogleAuthButton.module.scss'

interface GoogleAuthButtonProps {
  enabled: boolean
  invitationToken: string
}

export function GoogleAuthButton({ enabled, invitationToken }: GoogleAuthButtonProps) {
  const { t } = useTranslation()
  const intentMutation = useGoogleIntentMutation()
  const buttonDisabled = !enabled || intentMutation.isPending
  const googleError = intentMutation.error

  const handlePress = () => {
    intentMutation.mutate(invitationToken === '' ? undefined : invitationToken, {
      onSuccess: ({ authorizationPath }) => window.location.assign(authorizationPath),
    })
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.divider}>
        <span>{t('auth.google.or')}</span>
      </div>
      <Button className={styles.button} onPress={handlePress} isDisabled={buttonDisabled}>
        <img className={styles.icon} src={googleIcon} alt="" aria-hidden="true" />
        {t('auth.google.continue')}
      </Button>
      {googleError && (
        <AuthErrorMessage
          className={styles.error}
          error={googleError}
          fallbackKey="auth.errors.google"
        />
      )}
    </div>
  )
}
