import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PrismaClient } from '../generated/prisma'

export function connectDB(hyperdriveBinding: any) {
  if (!hyperdriveBinding?.connectionString) {
    throw new Error('Cloudflare Hyperdrive binding is missing or misconfigured.')
  }

  const pool = new Pool({
    connectionString: hyperdriveBinding.connectionString,
    max: 1,
  })

  const adapter = new PrismaPg(pool)

  return new PrismaClient({ adapter })
}
