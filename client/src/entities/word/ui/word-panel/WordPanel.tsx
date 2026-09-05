import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components'
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
        <X aria-hidden="true" size={20} strokeWidth={1.8} />
      </Button>
      <div className={styles.content}>{children}</div>
    </aside>
  )
}
