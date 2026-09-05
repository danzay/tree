import { Check, Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Menu, MenuItem, MenuTrigger, Popover, type Key } from 'react-aria-components'
import { useQueryErrorMessage } from '@/shared/api/useQueryErrorMessage'
import { LearningStatus, type LearningStatus as LearningStatusValue } from '../../model/types'
import { useUpdateWordStatus } from '../../model/useUpdateWordStatus'
import { WORD_STATUS_ACTIONS } from './consts'
import styles from './WordStatusControl.module.scss'

interface WordStatusControlProps {
  senseId: string
  status: LearningStatusValue
}

export function WordStatusControl({ senseId, status }: WordStatusControlProps) {
  const { t } = useTranslation()
  const statusMutation = useUpdateWordStatus()
  const statusError = useQueryErrorMessage(statusMutation, 'word.status.errors.update')
  const statusLabel = t(`word.status.labels.${status}`, { defaultValue: status })
  const showStatus = status !== LearningStatus.to_learn
  const menuLabel = statusMutation.isPending ? t('word.status.saving') : t('word.status.menuLabel')

  const handleAction = (key: Key) => {
    const nextStatus = String(key) as LearningStatusValue

    if (nextStatus === status) {
      return
    }

    statusMutation.mutate({ id: senseId, status: nextStatus })
  }

  return (
    <div className={styles.control}>
      <div className={styles.actions}>
        {showStatus && (
          <span className={styles.status} data-status={status}>
            {statusLabel}
          </span>
        )}
        <MenuTrigger>
          <Button
            className={styles.trigger}
            aria-label={menuLabel}
            isDisabled={statusMutation.isPending}
          >
            <Settings2 aria-hidden="true" size={16} strokeWidth={1.8} />
          </Button>
          <Popover className={styles.popover} placement="bottom end" offset={6}>
            <Menu
              className={styles.menu}
              aria-label={t('word.status.menuLabel')}
              selectionMode="single"
              selectedKeys={[status]}
              onAction={handleAction}
            >
              {WORD_STATUS_ACTIONS.map((action) => {
                const label = t(action.labelKey)
                const isSelected = action.status === status

                return (
                  <MenuItem
                    className={styles.item}
                    id={action.status}
                    isDisabled={isSelected}
                    textValue={label}
                    key={action.status}
                  >
                    <span>{label}</span>
                    {isSelected && <Check aria-hidden="true" size={15} strokeWidth={2} />}
                  </MenuItem>
                )
              })}
            </Menu>
          </Popover>
        </MenuTrigger>
      </div>
      {statusError && (
        <p className={styles.error} role="alert">
          {statusError}
        </p>
      )}
    </div>
  )
}
