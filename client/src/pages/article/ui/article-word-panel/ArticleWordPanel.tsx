import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'react-aria-components'
import { CLOSE_SYMBOL } from './consts'
import styles from './ArticleWordPanel.module.scss'

interface ArticleWordPanelProps {
  children: ReactNode
  onClose: () => void
}

export function ArticleWordPanel({ children, onClose }: ArticleWordPanelProps) {
  const { t } = useTranslation()

  return (
    <aside className={styles.panel} aria-label={t('article.wordPanel.label')}>
      <Button className={styles.close} aria-label={t('article.wordPanel.close')} onPress={onClose}>
        {CLOSE_SYMBOL}
      </Button>
      {children}
    </aside>
  )
}
