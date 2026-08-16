import pg from 'pg'

const { Pool } = pg

export function getDatabaseUrl(): string {
  const value = process.env.DATABASE_URL
  if (!value) {
    throw new Error('DATABASE_URL is required')
  }

  const parsed = new URL(value)
  if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
    throw new Error('DATABASE_URL must use the postgres or postgresql protocol')
  }

  return value
}

export function createDatabasePool(): pg.Pool {
  return new Pool({
    connectionString: getDatabaseUrl(),
    max: 10,
    connectionTimeoutMillis: 10_000,
  })
}
