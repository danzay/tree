import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components/Button'
import type { Invitation } from '@/features/auth'
import styles from './InvitationResult.module.scss'

interface InvitationResultProps {
  invitation: Invitation
  copied: boolean
  onCopy: (url: string) => void
}

export function InvitationResult({ invitation, copied, onCopy }: InvitationResultProps) {
  const { t } = useTranslation()

  const invitationUrl = `${window.location.origin}/login?mode=register&invite=${encodeURIComponent(invitation.token)}`
  const copyActionKey = copied ? 'account.actions.copied' : 'account.actions.copyLink'
  const handleCopy = () => onCopy(invitationUrl)

  return (
    <div className={styles.invitation}>
      <p>{t('account.registration.invitationReady', { email: invitation.email })}</p>
      <code>{invitationUrl}</code>
      <Button className={styles.copy} onPress={handleCopy}>
        {t(copyActionKey)}
      </Button>
    </div>
  )
}
