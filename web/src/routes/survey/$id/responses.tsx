import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { requireAuth } from '@/components/authenticatedRoutes'
import { getSurvey } from '../../../lib/api'
import { getSurveyResponses } from '../../../lib/storage'
import type { Survey } from '../../../lib/types'

export const Route = createFileRoute('/survey/$id/responses')({
  beforeLoad: requireAuth,
  component: SurveyResponsesPage,
})

function SurveyResponsesPage() {
  const { id } = Route.useParams() as { id: string }
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const responses = getSurveyResponses(id)

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        const response = await getSurvey(id)
        setSurvey(response.survey)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    loadSurvey()
  }, [id])

  if (!survey) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-10 text-center text-slate-300">
        <p className="text-xl font-semibold text-white">Survey not found</p>
        <p className="mt-3">The form you are looking for could not be found.</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          Back to dashboard
        </Link>
      </div>
    )
  }

  const questionViews = survey.questions.map((question: any) => {
    const answers = responses
      .map((response) => response.answers.find((answer) => answer.questionId === question.id))
      .filter((answer): answer is { questionId: string; value: string } => Boolean(answer))

    return (
      <div key={question.id} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
          {question.type === 'short_text'
            ? 'Short answer'
            : question.type === 'multiple_choice'
              ? 'Multiple choice'
              : 'Rating'}
        </p>
        <p className="mt-3 text-lg font-semibold text-white">{question.text}</p>
        <p className="mt-3 text-sm text-slate-400">
          {answers.length} answer{answers.length === 1 ? '' : 's'}
        </p>
        {question.type === 'rating' ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[1, 2, 3, 4, 5].map((value) => (
              <div
                key={value}
                className="rounded-2xl border border-slate-700 bg-slate-900 p-3 text-center text-sm text-slate-200"
              >
                <p className="font-semibold text-white">{value}</p>
                <p className="text-slate-400">
                  {answers.filter((answer) => answer.value === String(value)).length}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            {answers.slice(0, 5).map((answer, index) => (
              <div
                key={`${question.id}-${index}`}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3"
              >
                {answer.value}
              </div>
            ))}
            {answers.length > 5 ? (
              <p className="text-slate-500">+{answers.length - 5} more answers</p>
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
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Responses</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{survey.title}</h1>
            <p className="mt-2 text-slate-400">Review how respondents answered each question.</p>
          </div>
          <Link
            to="/dashboard"
            className="rounded-full bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="grid gap-6">{questionViews}</div>

      {!responses.length ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-10 text-center text-slate-400">
          <p className="text-lg font-medium text-white">No responses yet</p>
          <p className="mt-3">Send the public link to your audience to begin collecting results.</p>
        </div>
      ) : null}
    </div>
  )
}
