import treeLogo from '@/assets/library/tree-logo.svg'
import { useTranslation } from 'react-i18next'

import styles from './TreeLogo.module.scss'

export function TreeLogo() {
  const { t } = useTranslation()

  return <img className={styles.logo} src={treeLogo} alt={t('common.appName')} />
}
