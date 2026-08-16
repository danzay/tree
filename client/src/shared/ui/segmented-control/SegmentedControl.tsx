import type { ReactNode } from 'react'
import { ToggleButton, ToggleButtonGroup, type Key } from 'react-aria-components/ToggleButtonGroup'

interface SegmentedControlOption<T extends string> {
  value: T
  label: ReactNode
  ariaLabel?: string
}

interface SegmentedControlProps<T extends string> {
  value: T
  options: Array<SegmentedControlOption<T>>
  onValueChange: (value: T) => void
  ariaLabel: string
  className?: string
  itemClassName?: string
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onValueChange,
  ariaLabel,
  className,
  itemClassName,
}: SegmentedControlProps<T>) {
  const handleSelectionChange = (keys: Set<Key>) => {
    const nextValue = keys.values().next().value
    if (typeof nextValue === 'string') {
      onValueChange(nextValue as T)
    }
  }

  return (
    <ToggleButtonGroup
      className={className}
      selectionMode="single"
      selectedKeys={[value]}
      disallowEmptySelection
      onSelectionChange={handleSelectionChange}
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <ToggleButton
          className={itemClassName}
          id={option.value}
          aria-label={option.ariaLabel}
          key={option.value}
        >
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
