import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { normalizeHeadword } from './vocabulary.ts'

describe('vocabulary utilities', () => {
  it('normalizes search spelling without changing display spelling', () => {
    assert.equal(normalizeHeadword('  To   Differ  '), 'to differ')
  })
})
