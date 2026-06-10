import { getCookie } from 'hono/cookie'
import jwt from 'jsonwebtoken'
import credentialProvider from '../env'

const authMiddleware = async (content: any, next: any) => {
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
  } catch (_error: any) {
    console.log('Error finding the user. Please try again later ..')

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
