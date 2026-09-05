import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Dialog, Modal, ModalOverlay } from 'react-aria-components'
import styles from './WordModal.module.scss'

interface WordModalProps {
  children: ReactNode
  onClose: () => void
}

export function WordModal({ children, onClose }: WordModalProps) {
  const { t } = useTranslation()

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose()
    }
  }

  return (
    <ModalOverlay className={styles.overlay} isDismissable isOpen onOpenChange={handleOpenChange}>
      <Modal className={styles.modal}>
        <Dialog className={styles.dialog} aria-label={t('word.panel.label')}>
          <Button className={styles.close} aria-label={t('word.panel.close')} onPress={onClose}>
            <X aria-hidden="true" size={20} strokeWidth={1.8} />
          </Button>
          <div className={styles.content}>{children}</div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
