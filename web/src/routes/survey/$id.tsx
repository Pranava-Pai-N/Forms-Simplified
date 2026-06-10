import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { requireAuth } from '@/components/authenticatedRoutes'
import { getSurvey, updateSurvey } from '../../lib/api'
import type { Question, QuestionType, Survey, SurveyPayload } from '../../lib/types'

export const Route = createFileRoute('/survey/$id')({
  beforeLoad: requireAuth,
  component: SurveyEditorPage,
})

const questionTypes: Array<{ label: string; value: QuestionType }> = [
  { label: 'Short answer', value: 'short_text' },
  { label: 'Multiple choice', value: 'multiple_choice' },
  { label: 'Rating', value: 'rating' },
]

export function SurveyEditorPage() {
  const { id } = Route.useParams() as { id: string }
  const _navigate = useNavigate()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#7c3aed')
  const [questions, setQuestions] = useState<Question[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [rawOptionsInput, setRawOptionsInput] = useState<Record<string, string>>({})

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

    setTitle(survey.title)
    setDescription(survey.description ?? '')
    setCoverImage(survey.coverImage)
    setPrimaryColor(survey.primaryColor)
    setQuestions(survey.questions)

    setRawOptionsInput((prev) => {
      const updatedStrings = { ...prev }
      survey.questions.forEach((q) => {
        if (q.type === 'multiple_choice') {
          const serverString = (q.options ?? []).join(', ')

          const localCleaned = (prev[q.id] ?? '')
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean)
            .join(',')

          const serverCleaned = (q.options ?? []).join(',')

          if (localCleaned !== serverCleaned || !prev[q.id]) {
            updatedStrings[q.id] = serverString
          }
        }
      })
      return updatedStrings
    })
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
        <p className="mt-3">This form may have been deleted or the URL is invalid.</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          Back to dashboard
        </Link>
      </div>
    )
  }

  const handleQuestionChange = (questionId: string, update: Partial<Question>) => {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              ...update,
              options:
                update.type === 'multiple_choice'
                  ? (update.options ?? question.options ?? [])
                  : question.type === 'multiple_choice' &&
                      (update.type as string) !== 'multiple_choice'
                    ? undefined
                    : question.options,
            }
          : question,
      ),
    )
  }

  const addQuestion = (type: QuestionType) => {
    const newId = `${type}-${Date.now()}`

    if (type === 'multiple_choice') {
      setRawOptionsInput((prev) => ({ ...prev, [newId]: 'Option 1, Option 2' }))
    }

    setQuestions((current) => [
      ...current,
      {
        id: newId,
        text:
          type === 'short_text'
            ? 'New short answer question'
            : type === 'multiple_choice'
              ? 'New multiple choice question'
              : 'How would you rate this?',
        type,
        isRequired: false,
        order: current.length,
        options: type === 'multiple_choice' ? ['Option 1', 'Option 2'] : undefined,
      },
    ])
  }

  const removeQuestion = (questionId: string) => {
    setQuestions((current) => current.filter((question) => question.id !== questionId))
    setRawOptionsInput((prev) => {
      const copy = { ...prev }
      delete copy[questionId]
      return copy
    })
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim()) {
      setMessage('Survey title is required.')
      return
    }

    const payload: SurveyPayload = {
      title: title.trim(),
      description: description.trim(),
      coverImage,
      primaryColor,
      questions: questions.map((question, index) => ({
        ...question,
        order: index,
        options: question.type === 'multiple_choice' ? (question.options ?? []) : undefined,
      })),
    }

    try {
      const response = await updateSurvey(id, payload)
      setSurvey(response.survey)
      setMessage('Survey saved successfully.')
    } catch (error: any) {
      setMessage(error?.message ?? 'Unable to save survey. Please try again.')
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Edit survey</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{survey.title}</h1>
            <p className="mt-2 text-slate-400">
              Update your survey description, visual style, and question list.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/public/$id"
              params={{ id: survey.id }}
              className="rounded-full bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              View public form
            </Link>
            <Link
              to="/survey/$id/responses"
              params={{ id: survey.id }}
              className="rounded-full border border-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-500"
            >
              Responses
            </Link>
          </div>
        </div>
      </div>

      <form className="grid gap-8 lg:grid-cols-[1.5fr_1fr]" onSubmit={handleSave}>
        <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/10">
          {message ? (
            <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {message}
            </p>
          ) : null}
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-300">Survey name</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-300">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
              />
            </label>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-300">Cover image URL</span>
                <input
                  value={coverImage}
                  onChange={(event) => setCoverImage(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-300">Primary color</span>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(event) => setPrimaryColor(event.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                />
              </label>
            </div>
          </div>

          <button className="w-full rounded-2xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400">
            Save survey
          </button>
        </div>

        <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Questions</p>
              <p className="mt-2 text-slate-400">
                Drag and drop later for more advanced workflows.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {questionTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => addQuestion(type.value)}
                  className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
                >
                  + {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                      Question {index + 1}
                    </p>
                    <input
                      value={question.text}
                      onChange={(event) =>
                        handleQuestionChange(question.id, { text: event.target.value })
                      }
                      className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    className="rounded-full bg-rose-500/10 px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/20"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm text-slate-300">Question type</span>
                    <select
                      value={question.type}
                      onChange={(event) =>
                        handleQuestionChange(question.id, {
                          type: event.target.value as QuestionType,
                        })
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                    >
                      {questionTypes.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={question.isRequired}
                      onChange={(event) =>
                        handleQuestionChange(question.id, { isRequired: event.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-indigo-500"
                    />
                    <span className="text-sm text-slate-300">Required</span>
                  </label>
                </div>

                {question.type === 'multiple_choice' ? (
                  <label className="block mt-4">
                    <span className="text-sm text-slate-300">Options</span>
                    <input
                      value={rawOptionsInput[question.id] ?? ''}
                      onChange={(event) => {
                        const nextVal = event.target.value

                        setRawOptionsInput((prev) => ({ ...prev, [question.id]: nextVal }))

                        const cleanArray = nextVal
                          .split(',')
                          .map((o) => o.trim())
                          .filter(Boolean)

                        handleQuestionChange(question.id, { options: cleanArray })
                      }}
                      className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                      placeholder="Option 1, Option 2"
                    />
                    <p className="mt-2 text-sm text-slate-500">Separate options with commas.</p>
                  </label>
                ) : question.type === 'rating' ? (
                  <p className="mt-4 text-sm text-slate-400">
                    Respondents will choose a rating from 1 to 5.
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  )
}
