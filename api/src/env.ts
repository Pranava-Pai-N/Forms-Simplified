import dotenv from 'dotenv'

dotenv.config()

type environment = 'development' | 'production'

interface credentials {
  DATABASE_URL: string
  JWT_SECRET: string
  NODE_ENV: environment
}

const credentialProvider: credentials = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV === 'development' ? 'development' : 'production',
}

export default credentialProvider
