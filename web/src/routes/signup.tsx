import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await signup({ name, email, password })
      toast.success('Please login with the credentials ...')
      navigate({ to: '/login' })
    } catch (error: any) {
      setMessage(error.message ?? 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-white">Create your account</h1>
        <p className="text-slate-400">Start building branded surveys in minutes.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {message ? (
          <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{message}</p>
        ) : null}
        <label className="block">
          <span className="text-sm text-slate-300">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-300">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-white hover:text-indigo-300">
          Sign in
        </Link>
      </p>
    </div>
  )
}
