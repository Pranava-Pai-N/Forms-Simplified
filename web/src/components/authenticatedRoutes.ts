import { redirect } from '@tanstack/react-router'

export const requireAuth = async ({ context }: any) => {
  const { user } = context

  if (!user) {
    throw redirect({
      to: '/login',
    })
  }
}
