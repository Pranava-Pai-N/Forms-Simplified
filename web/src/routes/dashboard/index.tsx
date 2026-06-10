import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { requireAuth } from '@/components/authenticatedRoutes'
import { getUserSurveys } from '../../lib/api'
import type { Survey } from '../../lib/types'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
  beforeLoad: requireAuth,
})

function DashboardPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getUserSurveys()
        setSurveys(response.surveys)
      } catch {
        setSurveys([])
      }
    }

    load()
  }, [])

  const activeCount = surveys.length

  const cards = useMemo(
    () =>
      surveys.map((survey) => (
        <div
          key={survey.id}
          className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Your Surveys</p>
              <h2 className="mt-3 text-xl font-semibold text-white">{survey.title}</h2>
            </div>
            <div
              className="h-12 w-12 rounded-2xl"
              style={{ backgroundColor: survey.primaryColor }}
            />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            {survey.description ?? 'No description added yet.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/survey/$id"
              params={{ id: survey.id }}
              className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Edit
            </Link>
            <Link
              to="/survey/$id/responses"
              params={{ id: survey.id }}
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
            >
              Responses
            </Link>
            <button
              type="button"
              className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-200"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${import.meta.env.VITE_FRONTEND_URL}/public/${survey.id}`,
                )
                toast.success('Copied to clipboard successfully ...')
              }}
            >
              Copy public link
            </button>
          </div>
        </div>
      )),
    [surveys],
  )

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Your forms</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">
              Manage every survey in one place.
            </h1>
            <p className="mt-4 max-w-2xl text-slate-400">
              Create new forms, review responses, and share a public link with anyone.
            </p>
          </div>
          <Link
            to="/survey/new"
            className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Create form
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Active forms</p>
          <p className="mt-4 text-5xl font-semibold text-white">{activeCount}</p>
          <p className="mt-2 text-sm text-slate-400">
            Surveys available on your public share links.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Recent activity</p>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            Create a new survey to see response history and summary cards here.
          </p>
        </div>
      </div>

      <div className="grid gap-6">{cards.length ? cards : <EmptyState />}</div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-10 text-center text-slate-400">
      <p className="text-lg font-medium text-white">No surveys yet</p>
      <p className="mt-3">Create your first survey and share a public link in seconds.</p>
    </div>
  )
}
