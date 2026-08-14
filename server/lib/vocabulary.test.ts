import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  decodePartOfSpeech,
  inferImportedStatus,
  normalizeHeadword,
  parseExamples,
} from './vocabulary.ts'

describe('source vocabulary transformations', () => {
  it('maps each verified legacy status', () => {
    assert.equal(inferImportedStatus({ qRec: 0, qRep: 0, sRec: 0, sRep: 0, eRec: 2.5, eRep: 2.5 }), 'new')
    assert.equal(inferImportedStatus({ qRec: 2, qRep: 2, sRec: 1, sRep: 0, eRec: 2.5, eRep: 2.5 }), 'learning')
    assert.equal(inferImportedStatus({ qRec: 4, qRep: 4, sRec: 0, sRep: 0, eRec: 2.75, eRep: 2.5 }), 'learned')
    assert.equal(inferImportedStatus({ qRec: 4, qRep: 4, sRec: 0, sRep: 0, eRec: 2.5, eRep: 2.5 }), 'known')
  })

  it('normalizes search spelling without changing display spelling', () => {
    assert.equal(normalizeHeadword('  To   Differ  '), 'to differ')
  })

  it('decodes combined part-of-speech flags', () => {
    assert.deepEqual(decodePartOfSpeech(5), { codes: ['noun', 'adjective'], unknownBits: 0 })
  })

  it('parses source examples', () => {
    assert.deepEqual(parseExamples('[{"o":"The #can# is empty.","t":"#Банка# пустая."}]'), [
      { o: 'The #can# is empty.', t: '#Банка# пустая.' },
    ])
  })
})
