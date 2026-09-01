import { useTranslation } from 'react-i18next'
import type { AuthUser } from '@/features/auth'
import styles from './AccountSummary.module.scss'

interface AccountSummaryProps {
  user: AuthUser
}

export function AccountSummary({ user }: AccountSummaryProps) {
  const { t } = useTranslation()

  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>{t('account.profile.eyebrow')}</p>
      <h2>{user.displayName}</h2>
      <p className={styles.email}>{user.email}</p>
    </section>
  )
}
