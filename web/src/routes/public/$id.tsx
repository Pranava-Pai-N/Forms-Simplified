import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { getSurvey } from '../../lib/api'
import { getGuestId, hasSubmittedSurvey, submitSurveyResponse } from '../../lib/storage'
import type { Question, Survey } from '../../lib/types'

export const Route = createFileRoute('/public/$id')({
  component: PublicSurveyPage,
})

function PublicSurveyPage() {
  const { id } = Route.useParams() as { id: string }
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const guestId = useMemo(() => getGuestId(), [])

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

  useEffect(() => {
    if (!survey) return
    setAnswers(
      survey.questions.reduce(
        (acc, question) => {
          acc[question.id] = ''
          return acc
        },
        {} as Record<string, string>,
      ),
    )
  }, [survey])

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-10 text-center text-slate-300">
        <p className="text-xl font-semibold text-white">Loading survey…</p>
      </div>
    )
  }

  if (notFound || !survey) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-10 text-center text-slate-300">
        <p className="text-xl font-semibold text-white">Survey not found</p>
        <p className="mt-3">The survey link is invalid or the form has been removed.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          Back to home
        </Link>
      </div>
    )
  }

  const alreadySubmitted = hasSubmittedSurvey(survey.id, guestId)

  const handleAnswerChange = (question: Question, value: string) => {
    setAnswers((current) => ({ ...current, [question.id]: value }))
  }

  const isValid = survey.questions.every((question) => {
    if (!question.isRequired) return true

    const answer = answers[question.id]

    return typeof answer === 'string' && answer.trim().length > 0
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!survey) return

    if (!isValid) {
      setError('Please answer all required questions.')
      return
    }

    submitSurveyResponse(
      survey.id,
      guestId,
      survey.questions.map((question) => ({
        questionId: question.id,
        value: answers[question.id] ?? '',
      })),
    )
    setSubmitted(true)
  }

  if (alreadySubmitted || submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/95 p-10 text-center shadow-2xl shadow-slate-950/20">
        <p className="text-3xl font-semibold text-white">Thank you!</p>
        <p className="mt-4 text-slate-400">Your response has been recorded.</p>
        <button
          type="button"
          onClick={() => navigate({ to: '/' })}
          className="mt-6 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          Back to home
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
      <div className="rounded-3xl overflow-hidden bg-slate-800">
        <div
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${survey.coverImage})` }}
        />
        <div className="space-y-3 p-8" style={{ borderTop: `1px solid rgba(148, 163, 184, 0.1)` }}>
          <div className="flex items-center gap-3">
            <span
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: survey.primaryColor }}
            />
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{survey.title}</p>
          </div>
          <h1 className="text-3xl font-semibold text-white">{survey.title}</h1>
          <p className="text-slate-400">
            {survey.description ?? 'Share this form with anyone to start collecting feedback.'}
          </p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {error ? (
          <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>
        ) : null}

        {survey.questions.map((question) => (
          <div
            key={question.id}
            className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">
                  {question.type === 'short_text'
                    ? 'Short answer'
                    : question.type === 'multiple_choice'
                      ? 'Multiple choice'
                      : 'Rating'}
                </p>
                <p className="mt-2 text-lg font-semibold text-white">{question.text}</p>
              </div>
              {question.isRequired ? (
                <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-300">
                  Required
                </span>
              ) : null}
            </div>

            <div className="mt-5">
              {question.type === 'short_text' && (
                <input
                  value={answers[question.id] ?? ''}
                  onChange={(event) => handleAnswerChange(question, event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                  placeholder="Type your answer"
                />
              )}

              {question.type === 'rating' && (
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleAnswerChange(question, String(value))}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${answers[question.id] === String(value) ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'}`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              )}

              {question.type === 'multiple_choice' && (
                <div className="grid gap-3">
                  {(question.options ?? []).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleAnswerChange(question, option)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${answers[question.id] === option ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          type="submit"
          className="w-full rounded-2xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          Submit response
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Your responses are saved locally in this browser.
      </p>
    </div>
  )
}
