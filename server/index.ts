import { buildApp } from './app.ts'
import { createDatabasePool } from './db.ts'

const port = Number.parseInt(process.env.PORT ?? '3001', 10)
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT must be an integer between 1 and 65535')
}

const pool = createDatabasePool()
const app = buildApp(pool)

const shutdown = async () => {
  await app.close()
  await pool.end()
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)

try {
  await app.listen({ port, host: '127.0.0.1' })
} catch (error) {
  app.log.error({ errorName: error instanceof Error ? error.name : 'UnknownError' }, 'API failed to start')
  await pool.end()
  process.exitCode = 1
}
