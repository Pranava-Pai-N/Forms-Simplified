import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PrismaClient } from '../generated/prisma'

export function connectDB(databaseUrl: string): PrismaClient {
  if (!databaseUrl) {
    throw new Error(
      'Database URL is missing or misconfigured. Please add it in your environment variables',
    )
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
  })

  const adapter = new PrismaPg(pool)

  return new PrismaClient({ adapter })
}
