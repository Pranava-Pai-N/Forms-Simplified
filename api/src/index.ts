import { Hono } from 'hono'
import { cors } from 'hono/cors'
import mainRoute from './routes/index.routes'

type Env = {
  Bindings: {
    DATABASE_URL: string
    FRONTEND_URL: string
  }
}

const app = new Hono<Env>()

app.use('/api/*', async (c, next) => {
  const FRONTEND_URL = c.env.FRONTEND_URL || ''

  const corsMiddleware = cors({
    origin: [FRONTEND_URL],
    credentials: true,
  })
  return corsMiddleware(c, next)
})

app.route('/api', mainRoute)

app.get('/', (c) => c.json({ status: 200, message: 'Backend is running properly ...' }))

export default app
