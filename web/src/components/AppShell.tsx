import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully.')
    navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/">
            <h1 className="text-lg font-semibold tracking-tight">FormSimplified</h1>
          </Link>

          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <Link to="/" className="hover:text-white transition">
              Home
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-white transition">
                  Dashboard
                </Link>

                <div className="flex items-center gap-3 ml-2">
                  <img
                    src={user?.profileImage}
                    alt="Profile"
                    className="h-9 w-9 rounded-full border border-slate-700 object-cover"
                  />

                  <span className="hidden sm:block text-slate-300">{user.email}</span>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-full bg-slate-800 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-700"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="rounded-full bg-indigo-500 px-4 py-2 text-sm text-white transition hover:bg-indigo-400"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  )
}
