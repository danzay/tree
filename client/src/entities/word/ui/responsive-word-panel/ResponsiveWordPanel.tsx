import type { ReactNode } from 'react'
import { useMediaQuery } from '@/shared/lib/hooks/useMediaQuery'
import { WordModal } from '../word-modal/WordModal'
import { WordPanel } from '../word-panel/WordPanel'
import { MOBILE_WORD_PANEL_QUERY } from './consts'

interface ResponsiveWordPanelProps {
  children: ReactNode
  onClose: () => void
  sticky?: boolean
}

export function ResponsiveWordPanel({
  children,
  onClose,
  sticky = false,
}: ResponsiveWordPanelProps) {
  const isMobile = useMediaQuery(MOBILE_WORD_PANEL_QUERY)

  if (isMobile) {
    return <WordModal onClose={onClose}>{children}</WordModal>
  }

  return (
    <WordPanel sticky={sticky} onClose={onClose}>
      {children}
    </WordPanel>
  )
}
