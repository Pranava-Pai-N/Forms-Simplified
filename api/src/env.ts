import dotenv from 'dotenv'

dotenv.config()

const credentialProvider = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
}

export default credentialProvider
