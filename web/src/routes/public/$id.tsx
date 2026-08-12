import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState, useRef } from 'react'
import { getSurvey, submitSurvey } from '../../lib/api'
import { getGuestId, hasSubmittedSurvey, submitSurveyResponse } from '../../lib/storage'
import type { Question, Survey } from '../../lib/types'
import { toast } from 'sonner'

export const Route = createFileRoute('/public/$id')({
  component: PublicSurveyPage,
})

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? ''
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? ''

const DEFAULT_UPI_ID = import.meta.env.VITE_DEFAULT_UPI_ID ?? ''
const DEFAULT_PAYMENT_AMOUNT = import.meta.env.VITE_DEFAULT_PAYMENT_AMOUNT ?? ''

function PublicSurveyPage() {
  const { id } = Route.useParams() as { id: string }
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState<string>('')

  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({})
  const [activePaymentQuestionId, setActivePaymentQuestionId] = useState<string | null>(null)

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const navigate = useNavigate()
  const guestId = useMemo(() => getGuestId(), [])

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        const response = await getSurvey(id)
        setSurvey(response.survey)
        setPrimaryColor(response.survey.primaryColor)
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

  const handleFileUpload = async (questionId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please provide screenshot image of the payment')
      return
    }

    setUploadingState((prev) => ({ ...prev, [questionId]: true }))

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
        {
          method: 'POST',
          body: formData,
        },
      )
      const data = await res.json()

      if (data.secure_url) {
        setAnswers((current) => ({ ...current, [questionId]: data.secure_url }))
        toast.success('File uploaded successfully!')
        setActivePaymentQuestionId(null)
      } else {
        toast.error('Cloudinary upload failed. Check cloud name and preset.')
      }
    } catch {
      toast.error('Failed to upload file.')
    } finally {
      setUploadingState((prev) => ({ ...prev, [questionId]: false }))
    }
  }

  const getUpiQrUrl = (upiId: string, name: string, amount: string) => {
    return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount)}&cu=INR`
  }

  const getImageQR = (upiId: string, name: string, amount: string) => {
    const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount)}&cu=INR`
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-10 text-center text-slate-300">
        <p className="text-xl font-semibold text-white">Loading survey…</p>
      </div>
    )
  }

  if (notFound || !survey || !survey.isPublished) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-10 text-center text-slate-300">
        <p className="text-xl font-semibold text-white">Survey not found</p>
        <p className="mt-3">The survey link is invalid or the form has been removed.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold text-white filter brightness-110 transition hover:brightness-125"
          style={{ backgroundColor: primaryColor || '#6366f1' }}
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!survey || submitting) return

    setError(null)

    if (!isValid) {
      setError('Please answer all required questions.')
      toast.error('Please answer all required questions.')
      return
    }

    setSubmitting(true)

    const payload = {
      answers: survey.questions.map((question) => ({
        questionId: question.id,
        value: (answers[question.id] ?? '').trim(),
      })),
    }

    try {
      await submitSurvey(survey.id, payload)

      submitSurveyResponse(survey.id, guestId, payload.answers)

      setSubmitted(true)
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof Error) {
        setError(err?.message)
        toast.error(err?.message)
      } else {
        setError('Failed to submit responses. Please check your network connection.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (alreadySubmitted || submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/95 p-10 text-center shadow-2xl shadow-slate-950/20">
        <p className="text-3xl font-semibold text-white">Thank you!</p>
        <p className="mt-4 text-slate-400">Your response has been recorded.</p>
        <button
          type="button"
          onClick={() => navigate({ to: '/' })}
          className="mt-6 rounded-full px-6 py-3 text-sm font-semibold text-white filter brightness-110 transition hover:brightness-125"
          style={{ backgroundColor: primaryColor || '#6366f1' }}
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
              style={{ backgroundColor: primaryColor || '#6366f1' }}
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
                      : question.type === 'file'
                        ? 'Payment & File Upload'
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
                  disabled={submitting}
                  value={answers[question.id] ?? ''}
                  onChange={(event) => handleAnswerChange(question, event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition disabled:opacity-50"
                  style={{
                    ['--focus-color' as string]: primaryColor || '#6366f1',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--focus-color)')}
                  onBlur={(e) => (e.target.style.borderColor = '#334155')}
                  placeholder="Type your answer"
                />
              )}

              {question.type === 'rating' && (
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const isSelected = answers[question.id] === String(value)
                    return (
                      <button
                        key={value}
                        disabled={submitting}
                        type="button"
                        onClick={() => handleAnswerChange(question, String(value))}
                        className="rounded-2xl border px-4 py-3 text-sm font-semibold transition disabled:opacity-50"
                        style={{
                          backgroundColor: isSelected ? primaryColor || '#6366f1' : '#0f172a',
                          borderColor: isSelected ? primaryColor || '#6366f1' : '#334155',
                          color: isSelected ? '#ffffff' : '#e2e8f0',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.borderColor = '#64748b'
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.borderColor = '#334155'
                        }}
                      >
                        {value}
                      </button>
                    )
                  })}
                </div>
              )}

              {question.type === 'multiple_choice' && (
                <div className="grid gap-3">
                  {(question.options ?? []).map((option) => {
                    const isSelected = answers[question.id] === option
                    return (
                      <button
                        key={option}
                        disabled={submitting}
                        type="button"
                        onClick={() => handleAnswerChange(question, option)}
                        className="rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition disabled:opacity-50"
                        style={{
                          backgroundColor: isSelected ? primaryColor || '#6366f1' : '#0f172a',
                          borderColor: isSelected ? primaryColor || '#6366f1' : '#334155',
                          color: isSelected ? '#ffffff' : '#e2e8f0',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.borderColor = '#64748b'
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.borderColor = '#334155'
                        }}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              )}

              {question.type === 'file' && (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/80 p-6">
                  <input
                    type="file"
                    accept="image/*"
                    ref={(el) => {
                      fileInputRefs.current[question.id] = el
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(question.id, file)
                    }}
                    className="hidden"
                  />

                  {!activePaymentQuestionId && !answers[question.id] && (
                    <div className="flex flex-col items-center justify-center space-y-3 text-center">
                      <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-400">
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-label="Payment Details"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          Pay via UPI App or Scan QR
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Pay ₹{DEFAULT_PAYMENT_AMOUNT} and upload the transaction screenshot
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mt-2">
                        <a
                          href={getUpiQrUrl(DEFAULT_UPI_ID, survey.title, DEFAULT_PAYMENT_AMOUNT)}
                          onClick={() => setActivePaymentQuestionId(question.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 text-center w-full"
                        >
                          Open UPI App (GPay/Paytm/PhonePe)
                        </a>

                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => setActivePaymentQuestionId(question.id)}
                          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition w-full"
                        >
                          Show QR Code
                        </button>
                      </div>
                    </div>
                  )}

                  {activePaymentQuestionId === question.id && (
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                      <div className="rounded-2xl bg-white p-3 shadow-lg">
                        <img
                          src={getImageQR(DEFAULT_UPI_ID, survey.title, DEFAULT_PAYMENT_AMOUNT)}
                          alt="GPay QR Code"
                          className="h-44 w-44 rounded-lg"
                        />
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                          Scan with GPay / PhonePe / Paytm
                        </p>
                        <p className="text-sm text-slate-300 font-mono">
                          UPI ID: <span className="text-white font-bold">{DEFAULT_UPI_ID}</span>
                        </p>
                        <p className="text-sm text-slate-300">
                          Amount:{' '}
                          <span className="text-emerald-400 font-bold">
                            ₹{DEFAULT_PAYMENT_AMOUNT}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-xs">
                        <button
                          type="button"
                          disabled={uploadingState[question.id] || submitting}
                          onClick={() => fileInputRefs.current[question.id]?.click()}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                        >
                          {uploadingState[question.id]
                            ? 'Uploading...'
                            : 'Upload Screenshot / File'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivePaymentQuestionId(null)}
                          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {answers[question.id] && (
                    <div className="flex flex-col items-center justify-center space-y-2 text-center">
                      <div className="flex items-center gap-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-2xl border border-emerald-500/20 max-w-full truncate">
                        <span>✓ Uploaded:</span>
                        <a
                          href={answers[question.id]}
                          target="_blank"
                          rel="noreferrer"
                          className="underline truncate hover:text-emerald-300"
                        >
                          View Uploaded File
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[question.id]?.click()}
                        className="text-xs text-slate-400 underline hover:text-slate-200 mt-1"
                      >
                        Change file / re-upload
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl px-6 py-3 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed filter brightness-110 hover:brightness-125"
          style={{
            backgroundColor: primaryColor || '#6366f1',
          }}
        >
          {submitting ? 'Submitting response...' : 'Submit response'}
        </button>
      </form>
    </div>
  )
}
