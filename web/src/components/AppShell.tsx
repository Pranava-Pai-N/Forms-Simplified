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
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="absolute top-0 left-1/2 -z-10 h-75 w-full max-w-7xl -translate-x-1/2 bg-indigo-500/3 blur-[80px]" />

      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/70 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 h-16">
          <Link to="/" className="group flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white group-hover:text-slate-200 transition">
              Form<span className="text-indigo-400 font-medium">Simplified</span>
            </h1>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-5 text-sm font-medium text-slate-400">
            <Link to="/" className="hover:text-white transition hidden xs:block py-1.5 px-1">
              Home
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-white transition py-1.5 px-1">
                  Dashboard
                </Link>

                <div className="flex items-center gap-2 sm:gap-3 pl-1 border-l border-slate-900 ml-1">
                  <div className="relative group/avatar">
                    <img
                      src={user?.profileImage}
                      alt="Profile"
                      className="h-8 w-8 rounded-full border border-slate-800 object-cover bg-slate-900 shadow-inner"
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                  </div>

                  <span className="hidden lg:block text-xs text-slate-500 font-arial tracking-tight max-w-35 truncate">
                    {user.email}
                  </span>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-full bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white hover:border-slate-700 active:scale-95"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-full bg-slate-900 border border-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white active:scale-95"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="rounded-full bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/10 transition hover:bg-indigo-400 active:scale-95"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">{children}</main>
    </div>
  )
}
