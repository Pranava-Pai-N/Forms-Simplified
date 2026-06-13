import bcrypt from 'bcryptjs'
import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import jwt from 'jsonwebtoken'
import credentialProvider from '../env'
import { connectDB } from '../lib/database'
import { loginSchema, registerSchema } from '../utils/validations/authValidations'

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
    DATABASE_URL: string
  }
}

interface registerUser {
  name: string
  email: string
  password: string
}

interface loginUser {
  email: string
  password: string
}

const registerUser = async (content: Context<AppEnv>) => {
  const body = await content.req.json<registerUser>()

  const result = registerSchema.safeParse(body)

  if (!result.success) {
    return content.json(
      {
        success: false,
        message: `Please provide valid details : Name of 3 characters (min) and password of 6 characters (min)`,
        errors: result.error.flatten().fieldErrors,
      },
      400,
    )
  }

  const { name, email, password } = result.data

  if (!name || !email || !password) {
    return content.json(
      {
        success: false,
        message: 'Please provide all the details properly ...',
      },
      400,
    )
  }

  const prisma = connectDB(content.env.DATABASE_URL)

  const exisitingUser = await prisma.user.findFirst({
    where: {
      email: email,
    },
  })

  if (exisitingUser) {
    return content.json(
      {
        success: false,
        message: 'You already have an account. Please login with the credentials to continue',
      },
      400,
    )
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  })

  if (!user) {
    return content.json({
      success: false,
      message: 'Error creating the user. Try again later',
    })
  }

  return content.json(
    {
      success: true,
      message: 'User created successfully ..',
      user,
    },
    201,
  )
}

const loginUser = async (content: Context<AppEnv>) => {
  const body = await content.req.json<loginUser>()

  const result = loginSchema.safeParse(body)

  if (!result.success) {
    return content.json(
      {
        success: false,
        message: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
      },
      400,
    )
  }

  const { email, password } = result.data

  if (!email || !password) {
    return content.json(
      {
        success: false,
        message: 'Please provide all the details properly ...',
      },
      400,
    )
  }

  const prisma = connectDB(content.env.DATABASE_URL)

  const existingUser = await prisma.user.findFirst({
    where: {
      email: email,
    },
  })

  if (!existingUser) {
    return content.json(
      {
        success: false,
        message: 'User does not exists. Please signup first .',
      },
      400,
    )
  }

  const dbPassword = existingUser?.password
  const compared = await bcrypt.compare(password, dbPassword)

  if (!compared) {
    return content.json(
      {
        success: false,
        message: 'Incorrect password. Please try again with a correct password ...',
      },
      400,
    )
  }

  const token = jwt.sign(
    { id: existingUser.id, email: existingUser.email },
    credentialProvider.JWT_SECRET,
    { expiresIn: '1h' },
  )

  const cookieOptions = {
    httpOnly: true,
    secure: credentialProvider.NODE_ENV === 'production',
    sameSite: credentialProvider.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 60 * 60,
    path: '/',
  } as const;

  setCookie(content, 'token', token, cookieOptions)

  return content.json(
    {
      success: true,
      message: 'Login successful.',
      user: {
        id: existingUser,
        email: existingUser.email,
      },
    },
    200,
  )
}

const getMe = async (content: Context<AppEnv>) => {
  const userToken = content.get('user')
  const id = userToken.id

  const prisma = connectDB(content.env.DATABASE_URL)

  const user = await prisma.user.findFirst({
    where: {
      id: id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true,
      createdAt: true,
      createdSurveys: true,
      answers: true,
    },
  })

  return content.json(
    {
      success: true,
      user,
    },
    200,
  )
}

const logoutUser = async (content: Context<AppEnv>) => {
  setCookie(content, 'token', '', {
    httpOnly: true,
    secure: credentialProvider.NODE_ENV === 'production',
    sameSite: credentialProvider.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 0,
    path: '/',
  })

  return content.json(
    {
      success: true,
      message: 'Logged out successfully.',
    },
    200,
  )
}

const userControllers = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
}

export default userControllers
