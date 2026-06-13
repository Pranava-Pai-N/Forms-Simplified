import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { requireAuth } from '@/components/authenticatedRoutes'
import { getUserSurveys } from '../../lib/api'
import type { Survey } from '../../lib/types'
import qrcode from 'qrcode'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
  beforeLoad: requireAuth as (opts: unknown) => Promise<void>,
})

function DashboardPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [activeQRForm, setActiveQRForm] = useState<Survey | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')

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

  useEffect(() => {
    if (!activeQRForm) {
      setQrCodeDataUrl('')
      return
    }

    const url = `${import.meta.env.VITE_FRONTEND_URL}/public/${activeQRForm.shortId}`

    qrcode
      .toDataURL(url, { width: 250, margin: 2 })
      .then(setQrCodeDataUrl)
      .catch(() => toast.error('Failed to generate QR code'))
  }, [activeQRForm])

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
              params={{ id: survey.shortId }}
              className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Edit
            </Link>
            <Link
              to="/survey/$id/responses"
              params={{ id: survey.shortId }}
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
            >
              View Responses
            </Link>
            <button
              type="button"
              className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 transition"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${import.meta.env.VITE_FRONTEND_URL}/public/${survey.shortId}`,
                )
                toast.success('Copied to clipboard successfully ...')
              }}
            >
              Copy public link
            </button>

            <button
              type="button"
              className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 transition"
              onClick={() => {
                setActiveQRForm(survey)
              }}
            >
              Share QR Code
            </button>
          </div>
        </div>
      )),
    [surveys],
  )

  return (
    <div className="space-y-8">
      {activeQRForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl transition-all text-center">
            <h3 className="text-xl font-semibold text-white">Share QR Code</h3>
            <p className="mt-1 text-sm text-slate-400 truncate px-4">
              Form Name: {activeQRForm.title}
            </p>

            <div className="mt-4 mx-2 flex items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-2.5 pl-4 text-left">
              <span className="truncate text-xs font-mono text-slate-400 selection:bg-indigo-500/30 selection:text-white">
                {`${import.meta.env.VITE_FRONTEND_URL}/public/${activeQRForm.shortId}`}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${import.meta.env.VITE_FRONTEND_URL}/public/${activeQRForm.shortId}`,
                  )
                  toast.success('Link copied to clipboard!')
                }}
                className="shrink-0 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-slate-700 hover:text-indigo-300 transition"
              >
                Copy
              </button>
            </div>

            <div className="my-6 flex justify-center">
              {qrCodeDataUrl ? (
                <div className="rounded-2xl bg-white p-3 shadow-md">
                  <img src={qrCodeDataUrl} alt="Survey QR Code" className="w-50 h-50" />
                </div>
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-sm text-slate-500">
                  Generating...
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {qrCodeDataUrl && (
                <a
                  href={qrCodeDataUrl}
                  download={`${activeQRForm.title.toLowerCase().replace(/\s+/g, '-')}-qr.png`}
                  className="w-full py-2.5 rounded-xl bg-indigo-500 text-sm font-semibold text-white hover:bg-indigo-400 transition block text-center"
                >
                  Download Image
                </a>
              )}
              <button
                type="button"
                onClick={() => setActiveQRForm(null)}
                className="w-full py-2.5 rounded-xl border border-slate-700 bg-transparent text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
