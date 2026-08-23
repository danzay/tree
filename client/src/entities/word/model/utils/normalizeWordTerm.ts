const INFINITIVE_PREFIX_PATTERN = /^(?:\(to\)|to)\s+/i

export function normalizeWordTerm(term: string) {
  return term.trim().replace(INFINITIVE_PREFIX_PATTERN, '')
}
