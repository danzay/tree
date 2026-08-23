import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components'
import { CLOSE_SYMBOL } from './consts'
import styles from './WordPanel.module.scss'

interface WordPanelProps {
  children: ReactNode
  onClose: () => void
  sticky?: boolean
}

export function WordPanel({ children, onClose, sticky = false }: WordPanelProps) {
  const { t } = useTranslation()

  return (
    <aside
      className={styles.panel}
      aria-label={t('word.panel.label')}
      data-sticky={sticky || undefined}
    >
      <Button className={styles.close} aria-label={t('word.panel.close')} onPress={onClose}>
        {CLOSE_SYMBOL}
      </Button>
      <div className={styles.content}>{children}</div>
    </aside>
  )
}
