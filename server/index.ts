import { buildApp } from './app.ts'
import { createDatabasePool } from './db.ts'

const PORT = Number.parseInt(process.env.PORT ?? '3001', 10)
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65_535) {
  throw new Error('PORT must be an integer between 1 and 65535')
}

const POOL = createDatabasePool()
const APP = buildApp(POOL)

async function shutdown() {
  await APP.close()
  await POOL.end()
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)

try {
  await APP.listen({ port: PORT, host: '127.0.0.1' })
} catch (error) {
  const errorName = error instanceof Error ? error.name : 'UnknownError'
  APP.log.error({ errorName }, 'API failed to start')
  await POOL.end()
  process.exitCode = 1
}
