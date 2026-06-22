import type { Hyperdrive } from '@cloudflare/workers-types'
import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import jwt from 'jsonwebtoken'
import credentialProvider from '../env'
import { error } from 'node:console'

type UserContext = {
  id: string
  email?: string
  name?: string
}

type AppEnv = {
  Variables: {
    user: UserContext
  }
  Bindings: {
    HYPERDRIVE: Hyperdrive
  }
}

const authMiddleware = async (content: Context<AppEnv>, next: Next) => {
  try {
    const token = getCookie(content, 'token')

    if (!token) {
      return content.json(
        {
          success: false,
          message: 'Unauthorized User. Please provide a token .',
        },
        401,
      )
    }

    const decodedToken = jwt.verify(token, credentialProvider.JWT_SECRET) as {
      id: string
      email: string
    }

    if (!decodedToken) {
      return content.json(
        {
          success: false,
          message: 'Invalid token.',
        },
        401,
      )
    }

    content.set('user', decodedToken)
    await next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return content.json(
        {
          success: false,
          message: 'Token expired',
        },
        401,
      )
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return content.json(
        {
          success: false,
          message: 'Token error. Please try again later',
        },
        401,
      )
    }

    return content.json(
      {
        success: false,
        message: 'Error verifying the user. Please try again later ...',
      },
      500,
    )
  }
}

export default authMiddleware
