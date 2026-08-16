import { Button } from 'react-aria-components/Button'
import { ListBox, ListBoxItem } from 'react-aria-components/ListBox'
import { Popover } from 'react-aria-components/Popover'
import { Label, Select as ReactAriaSelect, SelectValue } from 'react-aria-components/Select'
import { SELECT_INDICATOR_ICON, SELECT_POPOVER_OFFSET, SELECT_TRIGGER_ICON } from './consts'
import styles from './Select.module.scss'

interface SelectOption<T extends string> {
  value: T
  label: string
}

interface SelectProps<T extends string> {
  value: T
  options: Array<SelectOption<T>>
  onValueChange: (value: T) => void
  label: string
  className?: string
  labelClassName?: string
  triggerClassName?: string
}

export function Select<T extends string>({
  value,
  options,
  onValueChange,
  label,
  className,
  labelClassName,
  triggerClassName,
}: SelectProps<T>) {
  const handleChange = (nextValue: unknown) => {
    onValueChange(nextValue as T)
  }

  return (
    <ReactAriaSelect className={className} value={value} onChange={handleChange}>
      <Label className={labelClassName}>{label}</Label>
      <Button className={triggerClassName}>
        <SelectValue />
        <span className={styles.triggerIcon} aria-hidden="true">
          {SELECT_TRIGGER_ICON}
        </span>
      </Button>
      <Popover className={styles.content} placement="bottom end" offset={SELECT_POPOVER_OFFSET}>
        <ListBox className={styles.list}>
          {options.map((option) => (
            <ListBoxItem
              className={styles.item}
              id={option.value}
              textValue={option.label}
              key={option.value}
            >
              <span>{option.label}</span>
              <span className={styles.indicator} aria-hidden="true">
                {SELECT_INDICATOR_ICON}
              </span>
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </ReactAriaSelect>
  )
}
