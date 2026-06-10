import { Hono } from 'hono'
import userControllers from '../controllers/users.controllers'
import authMiddleware from '../middlewares/auth.middleware'

type Bindings = {
  DB: D1Database
}

const userRoutes = new Hono<{ Bindings: Bindings }>()

userRoutes.post('/register', userControllers.registerUser)
userRoutes.post('/login', userControllers.loginUser)
userRoutes.get('/me', authMiddleware, userControllers.getMe)
userRoutes.post('/logout', authMiddleware, userControllers.logoutUser)

export default userRoutes
