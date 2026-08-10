import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { requireAuth } from '@/components/authenticatedRoutes'
import { getSurvey, updateSurvey } from '../../lib/api'
import type { Question, QuestionType, Survey, SurveyPayload } from '../../lib/types'

export const Route = createFileRoute('/survey/$id/')({
  beforeLoad: requireAuth as (opts: unknown) => Promise<void>,
  component: SurveyEditorPage,
})

const questionTypes: Array<{ label: string; value: QuestionType }> = [
  { label: 'Short answer', value: 'short_text' },
  { label: 'Multiple choice', value: 'multiple_choice' },
  { label: 'Rating', value: 'rating' },
  { label: 'File', value: 'file' }
]

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? ""
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? ""

const DEFAULT_UPI_ID = import.meta.env.VITE_DEFAULT_UPI_ID ?? ""
const DEFAULT_PAYMENT_AMOUNT = import.meta.env.VITE_DEFAULT_PAYMENT_AMOUNT ?? ""


function SurveyEditorPage() {
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
  const [isPublishing, setIsPublishing] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [fileUploadState, setFileUploadState] = useState<
    Record<string, { loading: boolean; url?: string; name?: string; paid?: boolean }>
  >({})

  const [activePaymentQuestionId, setActivePaymentQuestionId] = useState<string | null>(null)

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const isReadOnly = survey?.isPublished === true

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
    if (!survey) 
      return;

    setTitle(survey.title)
    setDescription(survey.description ?? '')
    setCoverImage(survey.coverImage)
    setPrimaryColor(survey.primaryColor)
    setQuestions(survey.questions)

    const freshStrings: Record<string, string> = {}

    survey.questions.forEach((q) => {
      if (q.type === 'multiple_choice') {
        freshStrings[q.id] = (q.options ?? []).join(', ')
      }
    })
    setRawOptionsInput(freshStrings)
  }, [survey])

  const handleCloudinaryUpload = async (file: File): Promise<{ url: string; public_id: string } | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )
      const data = await res.json()
      if (data.secure_url) {
        return { url: data.secure_url, public_id: data.public_id }
      } else {
        setMessage('Cloudinary upload failed. Check your cloud name and preset.')
        return null
      }
    } catch {
      setMessage('Error uploading file to Cloudinary.')
      return null
    }
  }

  const handleCoverImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const result = await handleCloudinaryUpload(file)
    setIsUploading(false)

    if (result?.url) {
      setCoverImage(result.url)
      setMessage('Cover image uploaded successfully to Cloudinary.')
    }
  }

  const handleQuestionFileUpload = async (questionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileUploadState((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], loading: true }
    }))

    const result = await handleCloudinaryUpload(file)

    if (result?.url) {
      setFileUploadState((prev) => ({
        ...prev,
        [questionId]: { loading: false, url: result.url, name: file.name, paid: true }
      }))
      setMessage(`Payment receipt / file "${file.name}" uploaded successfully!`)
      setActivePaymentQuestionId(null)
    } else {
      setFileUploadState((prev) => ({
        ...prev,
        [questionId]: { ...prev[questionId], loading: false }
      }))
    }
  }

  const getUpiQrUrl = (upiId: string, name: string, amount: string) => {
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
    if (isReadOnly) 
      return

    setQuestions((current) =>
      current.map((question) => {
        if (question.id !== questionId) return question

        const updatedQuestion = { ...question, ...update }

        if (update.type && update.type !== 'multiple_choice') {
          delete updatedQuestion.options
        }

        if (updatedQuestion.type === 'multiple_choice' && !updatedQuestion.options) {
          updatedQuestion.options = ['Option 1', 'Option 2']
        }

        return updatedQuestion
      }),
    )
  }

  const addQuestion = (type: QuestionType) => {
    if (isReadOnly) return

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
              : type === 'file'
                ? 'Payment & File Submission'
                : 'How would you rate this?',
        type,
        isRequired: false,
        order: current.length,
        options: type === 'multiple_choice' ? ['Option 1', 'Option 2'] : undefined,
      },
    ])
  }

  const removeQuestion = (questionId: string) => {
    if (isReadOnly) return

    setQuestions((current) => current.filter((question) => question.id !== questionId))
    setRawOptionsInput((prev) => {
      const copy = { ...prev }
      delete copy[questionId]
      return copy
    })
  }

  const moveQuestion = (currentIndex: number, direction: 'up' | 'down') => {
    if (isReadOnly) return
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= questions.length) return

    const sortedQuestions = [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    const temp = sortedQuestions[currentIndex] as Question
    sortedQuestions[currentIndex] = sortedQuestions[targetIndex] as Question
    sortedQuestions[targetIndex] = temp

    const updatedQuestions = sortedQuestions.map((question, idx) => ({
      ...question,
      order: idx,
    }))

    setQuestions(updatedQuestions)
  }

  const preparePayload = (): SurveyPayload => {
    return {
      title: title.trim(),
      description: description.trim(),
      coverImage,
      primaryColor,
      questions: questions
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((question, index) => ({
          ...question,
          order: index,
          options: question.type === 'multiple_choice' ? question.options : undefined,
        })),
    }
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isReadOnly) return

    if (!title.trim()) {
      setMessage('Survey title is required.')
      return
    }

    try {
      const response = await updateSurvey(id, preparePayload())
      setSurvey(response.survey)
      setMessage('Survey saved successfully.')
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message)
      } else {
        setMessage('Unable to save survey. Please try again.')
      }
    }
  }

  const handlePublish = async () => {
    if (isReadOnly) return

    if (!title.trim()) {
      setMessage('Survey title is required before publishing.')
      return
    }

    setIsConfirmOpen(true)
  }

  const confirmPublishAction = async () => {
    setIsConfirmOpen(false)
    setIsPublishing(true)
    try {
      const response = await updateSurvey(id, {
        ...preparePayload(),
        isPublished: true,
      } as unknown as SurveyPayload)

      setSurvey(response.survey)
      setMessage('Survey has been published and locked successfully.')
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error?.message)
      } else {
        setMessage('Unable to publish survey. Please try again.')
      }
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="space-y-8">
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl transition-all">
            <div className="mt-4">
              <h3 className="text-xl font-semibold text-white">Publish Survey</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Are you sure you want to publish this survey? Once published, questions and
                configurations cannot be changed or reverted.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-xl border border-slate-700 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPublishAction}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition"
              >
                Yes, Publish Live
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
              {isReadOnly ? 'Published Survey' : 'Edit survey'}
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{survey.title}</h1>
            <p className="mt-2 text-slate-400">
              {isReadOnly
                ? 'This survey is live. Changes are disabled.'
                : 'Update your survey description, visual style, and question list.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/public/$id"
              params={{ id: survey.shortId }}
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

      <form className="space-y-8" onSubmit={handleSave}>
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
                disabled={isReadOnly}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500 disabled:opacity-50"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-300">Description</span>
              <textarea
                value={description}
                disabled={isReadOnly}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500 disabled:opacity-50"
              />
            </label>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-300">
                  Cover Image (Cloudinary Upload or URL)
                </span>
                <div className="mt-2 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isReadOnly || isUploading}
                    onChange={handleCoverImageFileChange}
                    className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-800 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-700 disabled:opacity-50"
                  />
                  <input
                    value={coverImage}
                    disabled={isReadOnly}
                    placeholder="or paste image URL"
                    onChange={(event) => setCoverImage(event.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-sm text-slate-300">Primary color</span>
                <input
                  type="color"
                  value={primaryColor}
                  disabled={isReadOnly}
                  onChange={(event) => setPrimaryColor(event.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500 disabled:opacity-50"
                />
              </label>
            </div>
          </div>

          {!isReadOnly ? (
            <div className="flex justify-end gap-4 max-w-md ml-auto">
              <button
                type="submit"
                disabled={isUploading}
                className="w-full rounded-2xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
              >
                Save survey
              </button>
              <button
                type="button"
                disabled={isPublishing || isUploading}
                onClick={handlePublish}
                className="w-full rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {isPublishing ? 'Publishing...' : 'Publish Survey'}
              </button>
            </div>
          ) : (
            <div className="w-full rounded-2xl bg-slate-800 p-4 text-center text-sm font-semibold text-slate-400 border border-slate-700">
              This survey has been published and cannot be modified
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto space-y-6 rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-xl shadow-slate-950/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Questions</p>
              <p className="mt-1 text-sm text-slate-400">Manage and layout options below.</p>
            </div>
            {!isReadOnly && (
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
            )}
          </div>

          <div className="space-y-4">
            {questions
              .slice()
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((question, index) => (
                <div
                  key={question.id}
                  className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                        Question {index + 1}
                      </p>
                      <input
                        value={question.text}
                        disabled={isReadOnly}
                        onChange={(event) =>
                          handleQuestionChange(question.id, { text: event.target.value })
                        }
                        className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-indigo-500 disabled:opacity-50"
                      />
                    </div>

                    {!isReadOnly && (
                      <div className="flex items-center gap-2 mt-8">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveQuestion(index, 'up')}
                            className="rounded-lg bg-slate-800 p-2 text-xs text-slate-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition"
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={index === questions.length - 1}
                            onClick={() => moveQuestion(index, 'down')}
                            className="rounded-lg bg-slate-800 p-2 text-xs text-slate-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition"
                            title="Move Down"
                          >
                            ▼
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
                          className="rounded-xl bg-rose-500/10 px-3 py-4 text-sm text-rose-300 hover:bg-rose-500/20 transition self-stretch"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm text-slate-300">Question type</span>
                      <select
                        value={question.type}
                        disabled={isReadOnly}
                        onChange={(event) =>
                          handleQuestionChange(question.id, {
                            type: event.target.value as QuestionType,
                          })
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-indigo-500 disabled:opacity-50"
                      >
                        {questionTypes.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 mt-7 sm:mt-2 cursor-pointer opacity-100 disabled:opacity-50">
                      <input
                        type="checkbox"
                        checked={question.isRequired}
                        disabled={isReadOnly}
                        onChange={(event) =>
                          handleQuestionChange(question.id, { isRequired: event.target.checked })
                        }
                        className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-indigo-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-slate-300">Required</span>
                    </label>
                  </div>

                  {question.type === 'multiple_choice' ? (
                    <label className="block mt-4">
                      <span className="text-sm text-slate-300">Options</span>
                      <input
                        value={rawOptionsInput[question.id] ?? ''}
                        disabled={isReadOnly}
                        onChange={(event) => {
                          const nextVal = event.target.value

                          setRawOptionsInput((prev) => ({ ...prev, [question.id]: nextVal }))

                          const cleanArray = nextVal
                            .split(',')
                            .map((o) => o.trim())
                            .filter(Boolean)

                          handleQuestionChange(question.id, { options: cleanArray })
                        }}
                        className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-indigo-500 disabled:opacity-50"
                        placeholder="Option 1, Option 2"
                      />
                      {!isReadOnly && (
                        <p className="mt-2 text-sm text-slate-500">Separate options with commas.</p>
                      )}
                    </label>
                  ) : question.type === 'rating' ? (
                    <p className="mt-4 text-sm text-slate-400">
                      Respondents will choose a rating from 1 to 5.
                    </p>
                  ) : question.type === 'file' ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-700 bg-slate-900/80 p-6">
                      <input
                        type="file"
                        ref={(el) => {
                          fileInputRefs.current[question.id] = el
                        }}
                        onChange={(e) => handleQuestionFileUpload(question.id, e)}
                        className="hidden"
                      />

                      {!activePaymentQuestionId && !fileUploadState[question.id]?.url && (
                        <div className="flex flex-col items-center justify-center space-y-3 text-center">
                          <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-400">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-200">
                              Scan GPay QR & Upload Payment Proof
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Pay ₹{DEFAULT_PAYMENT_AMOUNT} and attach the transaction screenshot
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActivePaymentQuestionId(question.id)}
                            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
                          >
                            Pay via GPay & Upload File
                          </button>
                        </div>
                      )}

                      {activePaymentQuestionId === question.id && (
                        <div className="flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                          <div className="rounded-2xl bg-white p-3 shadow-lg">
                            <img
                              src={getUpiQrUrl(DEFAULT_UPI_ID, survey.title || 'Payment', DEFAULT_PAYMENT_AMOUNT)}
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
                              Amount: <span className="text-emerald-400 font-bold">₹{DEFAULT_PAYMENT_AMOUNT}</span>
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-xs">
                            <button
                              type="button"
                              disabled={fileUploadState[question.id]?.loading}
                              onClick={() => fileInputRefs.current[question.id]?.click()}
                              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                            >
                              {fileUploadState[question.id]?.loading ? (
                                <>
                                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Uploading...
                                </>
                              ) : (
                                'Upload Proof / File'
                              )}
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

                      {fileUploadState[question.id]?.url && (
                        <div className="flex flex-col items-center justify-center space-y-2 text-center">
                          <div className="flex items-center gap-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-2xl border border-emerald-500/20 max-w-full truncate">
                            <span>✓ File Uploaded:</span>
                            <a
                              href={fileUploadState[question.id]?.url}
                              target="_blank"
                              rel="noreferrer"
                              className="underline truncate hover:text-emerald-300"
                            >
                              {fileUploadState[question.id]?.name || fileUploadState[question.id]?.url}
                            </a>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActivePaymentQuestionId(question.id)}
                            className="text-xs text-slate-400 underline hover:text-slate-200 mt-1"
                          >
                            Re-upload or view QR code
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
          </div>
        </div>
      </form>
    </div>
  )
}