import bcrypt from 'bcryptjs'
import { setCookie } from 'hono/cookie'
import jwt from 'jsonwebtoken'
import credentialProvider from '../env'
import { connectDB } from '../lib/database'

const registerUser = async (content: any) => {
  const body = await content.req.json()

  const { name, email, password } = body

  if (!name || !email || !password) {
    return content.json(
      {
        success: false,
        message: 'Please provide all the details properly ...',
      },
      400,
    )
  }

  const prisma = connectDB(content.env.HYPERDRIVE)

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

const loginUser = async (content: any) => {
  const body = await content.req.json()

  const { email, password } = body

  if (!email || !password) {
    return content.json(
      {
        success: false,
        message: 'Please provide all the details properly ...',
      },
      400,
    )
  }

  const prisma = connectDB(content.env.HYPERDRIVE)

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
    secure: false,
    sameSite: 'Strict' as const,
    maxAge: 60 * 60,
    path: '/',
  }

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

const getMe = async (content: any) => {
  const userToken = content.get('user')
  const id = userToken.id

  const prisma = connectDB(content.env.HYPERDRIVE)

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

const logoutUser = async (content: any) => {
  setCookie(content, 'token', '', {
    httpOnly: true,
    secure: false,
    sameSite: 'Strict',
    maxAge: 0,
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
