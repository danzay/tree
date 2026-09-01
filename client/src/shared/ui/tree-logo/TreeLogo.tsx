import treeLogo from '@/assets/library/tree-logo.svg'
import treeLogoMark from '@/assets/library/tree-logo-mark.svg'
import { useTranslation } from 'react-i18next'

import styles from './TreeLogo.module.scss'

interface TreeLogoProps {
  compact?: boolean
}

export function TreeLogo({ compact = false }: TreeLogoProps) {
  const { t } = useTranslation()

  return (
    <img
      className={styles.logo}
      data-compact={compact || undefined}
      src={compact ? treeLogoMark : treeLogo}
      alt={t('common.appName')}
    />
  )
}
