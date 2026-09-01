import { WORD_SENSE_SELECTOR } from '../consts'

export function closestWordElement(node: Node | null): HTMLElement | null {
  const element = node instanceof Element ? node : node?.parentElement

  return element?.closest<HTMLElement>(WORD_SENSE_SELECTOR) ?? null
}
