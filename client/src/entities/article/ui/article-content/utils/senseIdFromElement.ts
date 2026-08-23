export function senseIdFromElement(element: HTMLElement | null): number | null {
  const senseId = Number(element?.dataset.senseId)
  const hasValidSenseId = Number.isInteger(senseId) && senseId > 0

  if (!hasValidSenseId) {
    return null
  }

  return senseId
}
