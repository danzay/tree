import { useTranslation } from 'react-i18next'
import { useAuthenticatedUser, useAuthConfigQuery } from '@/features/auth'
import { AccountSecurity } from '../account-security/AccountSecurity'
import { AccountSummary } from '../account-summary/AccountSummary'
import { InvitationSettings } from '../invitation-settings/InvitationSettings'
import styles from './AccountPage.module.scss'

export function AccountPage() {
  const { t } = useTranslation()
  const user = useAuthenticatedUser()
  const configQuery = useAuthConfigQuery()
  const googleEnabled = configQuery.data?.googleEnabled === true
  const showInvitationSettings = user.canManageInvitations

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>{t('account.title')}</h1>
        <span>{t('account.description')}</span>
      </header>
      <div className={styles.content}>
        <AccountSummary user={user} />
        <AccountSecurity user={user} googleEnabled={googleEnabled} />
        {showInvitationSettings && <InvitationSettings />}
      </div>
    </div>
  )
}
