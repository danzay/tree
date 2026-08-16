import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components/Button'
import { DISMISS_NOTICE_ICON } from './consts'
import styles from './LibraryNotice.module.scss'

interface LibraryNoticeProps {
  message: string
  onDismiss: () => void
}

export function LibraryNotice({ message, onDismiss }: LibraryNoticeProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.notice} role="status">
      <span>{message}</span>
      <Button type="button" onPress={onDismiss} aria-label={t('library.actions.dismiss')}>
        {DISMISS_NOTICE_ICON}
      </Button>
    </div>
  )
}
