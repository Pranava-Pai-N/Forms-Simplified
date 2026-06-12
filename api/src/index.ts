import { Hono } from 'hono'
import mainRoute from './routes/index.routes'

type Bindings = {
  Bindings: {
    HYPERDRIVE: {
      connectionString: string
    }
    DATABASE_URL: string
  }
}

const app = new Hono<{ Bindings: Bindings }>()

app.route('/api', mainRoute)

app.get('/', (c) => c.json({ status: 200, message: 'Backend is running properly ...' }))

export default app
