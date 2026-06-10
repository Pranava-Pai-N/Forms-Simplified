import type { Question, Survey, SurveyPayload } from './types'

const SURVEYS_KEY = 'formflow.surveys'
const RESPONSES_KEY = 'formflow.responses'

function storageRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

function storageWrite<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function createId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function loadSurveys(): Survey[] {
  return storageRead<Survey[]>(SURVEYS_KEY, [])
}

export function saveSurveys(surveys: Survey[]) {
  storageWrite(SURVEYS_KEY, surveys)
}

export function createSurvey(payload: SurveyPayload): Survey {
  const survey: Survey = {
    id: createId(),
    title: payload.title,
    description: payload.description ?? null,
    coverImage: payload.coverImage,
    primaryColor: payload.primaryColor,
    creatorId: 'local-user',
    createdAt: new Date().toISOString(),
    questions: payload.questions.map((question, index) => ({
      ...question,
      id: createId(),
      order: index,
    })),
  }
  const surveys = loadSurveys()
  saveSurveys([survey, ...surveys])
  return survey
}

export function updateSurvey(id: string, payload: SurveyPayload): Survey | null {
  const surveys = loadSurveys()
  const nextSurveys = surveys.map((survey) =>
    survey.id === id
      ? {
          ...survey,
          title: payload.title,
          description: payload.description ?? null,
          coverImage: payload.coverImage,
          primaryColor: payload.primaryColor,
          questions: payload.questions.map((question, index) => ({
            ...question,
            id: question.id || createId(),
            order: index,
          })),
        }
      : survey,
  )
  saveSurveys(nextSurveys)
  return nextSurveys.find((survey) => survey.id === id) ?? null
}

export function getSurvey(id: string): Survey | null {
  return loadSurveys().find((survey) => survey.id === id) ?? null
}

export type ResponseRecord = {
  surveyId: string
  guestId: string
  answers: Array<{ questionId: string; value: string }>
  createdAt: string
}

export function loadResponses(): ResponseRecord[] {
  return storageRead<ResponseRecord[]>(RESPONSES_KEY, [])
}

export function saveResponses(responses: ResponseRecord[]) {
  storageWrite(RESPONSES_KEY, responses)
}

export function submitSurveyResponse(
  surveyId: string,
  guestId: string,
  answers: Array<{ questionId: string; value: string }>,
) {
  const responses = loadResponses()
  const next = [...responses, { surveyId, guestId, answers, createdAt: new Date().toISOString() }]
  saveResponses(next)
  return next.filter((response) => response.surveyId === surveyId)
}

export function getSurveyResponses(surveyId: string) {
  return loadResponses().filter((response) => response.surveyId === surveyId)
}

export function hasSubmittedSurvey(surveyId: string, guestId: string) {
  return loadResponses().some(
    (response) => response.surveyId === surveyId && response.guestId === guestId,
  )
}

export function getGuestId() {
  const key = 'formflow.guestId'
  if (typeof window === 'undefined') return 'anonymous'
  let guestId = window.localStorage.getItem(key)
  if (!guestId) {
    guestId = createId()
    window.localStorage.setItem(key, guestId)
  }
  return guestId
}
