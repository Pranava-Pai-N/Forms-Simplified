import { redirect } from '@tanstack/react-router'

export interface AuthContext {
  user: {
    id: string
    email?: string
    name?: string
  } | null
}

export const requireAuth = async ({ context }: { context: AuthContext }) => {
  const { user } = context

  if (!user) {
    throw redirect({
      to: '/login',
    })
  }
}
