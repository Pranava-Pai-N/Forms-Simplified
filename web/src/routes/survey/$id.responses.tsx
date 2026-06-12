import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { requireAuth } from '@/components/authenticatedRoutes'
import { getSurveyResponses } from '../../lib/api'
import type { Question } from '../../lib/types'

export const Route = createFileRoute('/survey/$id/responses')({
  beforeLoad: requireAuth as (opts: unknown) => Promise<void>,
  component: SurveyResponsesPage,
})

interface CleanAnswer {
  id: string
  userId: string | null
  guestId: string | null
  value: string
  createdAt: string
}

interface AnalyticsQuestion extends Question {
  answers: CleanAnswer[]
}

interface FullSurveyPayload {
  id: string
  title: string
  description?: string | null
  questions: AnalyticsQuestion[]
}

function SurveyResponsesPage() {
  const { id } = Route.useParams() as { id: string }
  const [survey, setSurvey] = useState<FullSurveyPayload | null>(null)
  const [responsesCount, setResponsesCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true)
        const response = await getSurveyResponses(id)
        console.log(response)

        setSurvey(response.survey)
        setResponsesCount(response.responseResult.length)
      } catch (error) {
        console.error('Failed to load response data:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    loadAnalyticsData()
  }, [id])

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-10 text-center text-slate-300">
        <p className="text-xl font-semibold text-white">Loading survey analytics…</p>
      </div>
    )
  }

  if (notFound || !survey) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-10 text-center text-slate-300">
        <p className="text-xl font-semibold text-white">Survey analytics not found</p>
        <p className="mt-3">
          The form you are looking for could not be found or access was denied.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          Back to dashboard
        </Link>
      </div>
    )
  }

  const questionViews = survey.questions.map((question) => {
    const answers = question.answers || []

    return (
      <div key={question.id} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            {question.type === 'short_text'
              ? 'Short answer'
              : question.type === 'multiple_choice'
                ? 'Multiple choice'
                : 'Rating'}
          </p>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">
            {answers.length} response{answers.length === 1 ? '' : 's'}
          </span>
        </div>

        <p className="mt-3 text-lg font-semibold text-white">{question.text}</p>

        {question.type === 'rating' ? (
          <div className="mt-5 grid grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((value) => {
              const count = answers.filter((ans) => String(ans.value) === String(value)).length
              return (
                <div
                  key={value}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3 text-center transition hover:border-slate-700"
                >
                  <p className="text-sm font-bold text-slate-400">Score</p>
                  <p className="text-xl font-semibold text-white mt-1">{value}</p>
                  <div className="mt-2 rounded-lg bg-indigo-500/10 py-1 text-xs font-semibold text-indigo-300">
                    {count} votes
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mt-5 space-y-2.5">
            {answers.slice(0, 5).map((answer) => (
              <div
                key={answer.id}
                className="flex flex-col gap-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:bg-slate-900/90"
              >
                <p className="text-sm text-white">{answer.value}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <span>{answer.guestId !== null ? 'Anonymous Guest' : 'Verified User'}</span>
                  <span>•</span>
                  <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            {answers.length > 5 ? (
              <p className="text-xs font-medium text-slate-500 pl-2">
                📂 +{answers.length - 5} additional submissions hidden
              </p>
            ) : null}
          </div>
        )}
      </div>
    )
  })

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                Live Dashboard
              </span>
              <span className="text-xs text-slate-500">
                {responsesCount} Unique Submissions Total
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-white">{survey.title}</h1>
            <p className="mt-2 text-slate-400">
              {survey.description ||
                'Reviewing user & guest insights aggregate distribution matrices.'}
            </p>
          </div>
          <Link
            to="/dashboard"
            className="self-start rounded-full bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 sm:self-center"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="grid gap-6">{questionViews}</div>

      {!responsesCount ? (
        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
          <p className="text-lg font-medium text-white">No entries logged yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Share the public distribution route link to accumulate tracking metric logs.
          </p>
        </div>
      ) : null}
    </div>
  )
}
