import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { requireAuth } from '@/components/authenticatedRoutes'
import { createSurvey } from '../../lib/api'
import type { SurveyPayload } from '../../lib/types'

export const Route = createFileRoute('/survey/new')({
  beforeLoad: requireAuth,
  component: CreateSurveyPage,
})

export function CreateSurveyPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  )
  const [primaryColor, setPrimaryColor] = useState('#7c3aed')
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim()) {
      setError('A survey title is required.')
      return
    }

    const surveyPayload: SurveyPayload = {
      title: title.trim(),
      description: description.trim(),
      coverImage,
      primaryColor,
      questions: [
        { id: 'q1', text: 'What is your name?', type: 'short_text', isRequired: true, order: 0 },
        {
          id: 'q2',
          text: 'What feature would you use most?',
          type: 'multiple_choice',
          isRequired: true,
          order: 1,
          options: ['Branding', 'Questions', 'Response view'],
        },
        { id: 'q3', text: 'Rate this concept', type: 'rating', isRequired: true, order: 2 },
      ],
    }

    try {
      const response = await createSurvey(surveyPayload)
      navigate({ to: `/survey/${response.survey.id}` })
    } catch (error: any) {
      setError(error?.message ?? 'Unable to create survey. Please try again.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-10 shadow-2xl backdrop-blur-md">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
          New Survey
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Give your survey a name and brand it.
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Start from a simple description, add a cover image and set a primary tone for the form.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleCreate}>
        {error ? (
          <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300 animate-in fade-in-50 duration-200">
            {error}
          </p>
        ) : null}

        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Survey name
          </span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            placeholder="e.g. Customer feedback survey"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Description
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none"
            rows={4}
            placeholder="Describe what this survey is for"
          />
        </label>

        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/40 shadow-inner">
          <div className="relative h-32 w-full bg-slate-900/50">
            {coverImage ? (
              <img
                src={coverImage}
                alt="Survey branding preview"
                className="h-full w-full object-cover opacity-70 transition-opacity duration-300"
                onError={(e) => {
                  e.currentTarget.style.opacity = '0'
                }}
              />
            ) : null}
            <div
              className="absolute bottom-0 left-0 right-0 h-1.5 transition-colors duration-200"
              style={{ backgroundColor: primaryColor }}
            />
            <div className="absolute inset-0 flex items-end bg-linear-to- from-slate-950/80 to-transparent p-4">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-300 backdrop-blur-sm bg-slate-900/40 px-2.5 py-1 rounded-md border border-slate-800/60">
                Your Cover Image
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cover image URL
            </span>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              placeholder="https://..."
            />
          </label>

          <div className="space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Primary color
            </span>
            <div className="relative flex h-11 w-full items-center rounded-2xl border border-slate-800 bg-slate-950/60 px-3 transition-within focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10">
              <input
                type="color"
                value={primaryColor}
                onChange={(event) => setPrimaryColor(event.target.value)}
                className="h-7 w-10 cursor-pointer rounded-lg border border-slate-800 bg-transparent outline-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-0"
              />
              <span className="absolute right-4 pointer-events-none font-mono text-xs text-slate-500 uppercase tracking-wider">
                {primaryColor}
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 transition hover:bg-indigo-500 active:scale-[0.99]"
        >
          Create survey
        </button>
      </form>
    </div>
  )
}
