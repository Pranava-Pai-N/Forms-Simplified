import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../lib/api'
import type { User } from '../lib/types'

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (payload: { email: string; password: string }) => Promise<void>
  signup: (payload: { name: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const data = await getCurrentUser()
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = async (payload: { email: string; password: string }) => {
    await loginUser(payload)
    await refresh()
  }

  const signup = async (payload: { name: string; email: string; password: string }) => {
    await registerUser(payload)
    await refresh()
  }

  const logout = async () => {
    await logoutUser()
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, refresh }),
    [user, loading, login],
  )

  return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
