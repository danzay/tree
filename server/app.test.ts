import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type pg from 'pg'
import { buildApp } from './app.ts'

interface QueryCall {
  text: string
  values: unknown[] | undefined
}

describe('word search API', () => {
  it('uses a parameterized substring query with ranked matches', async () => {
    const queryCalls: QueryCall[] = []
    const pool = {
      query: async (text: string, values?: unknown[]) => {
        queryCalls.push({ text, values })
        return { rows: [] }
      },
    } as unknown as pg.Pool
    const app = buildApp(pool)

    try {
      const response = await app.inject({ method: 'GET', url: '/api/words?q=differ' })

      assert.equal(response.statusCode, 200)
      assert.equal(queryCalls.length, 1)

      const call = queryCalls[0]
      assert.ok(call)
      assert.match(call.text, /strpos\(h\.normalized_word, \$2\) > 0/)
      assert.match(call.text, /WHEN h\.normalized_word = \$2 THEN 0/)
      assert.match(call.text, /WHEN h\.normalized_word = 'to ' \|\| \$2 THEN 1/)
      assert.deepEqual(call.values, ['ru', 'differ', 30, 0])
    } finally {
      await app.close()
    }
  })
})
