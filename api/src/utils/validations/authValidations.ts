import { z } from 'zod'

export const registerSchema = z.object({
  name: z
    .string()
    .describe('Please enter your name')
    .min(3, { message: 'Name should be atleast 3 characters long ...' }),
  email: z.email().describe('Please provide a valid email id ..'),
  password: z
    .string()
    .describe('Please enter a password')
    .min(6, { message: 'Password should be atleast 6 characters long ...' }),
})

export const loginSchema = z.object({
  email: z.email().describe('Please provide a valid email id ..'),
  password: z
    .string()
    .describe('Please enter a password')
    .min(6, { message: 'Password should be atleast 6 characters long ...' }),
})
