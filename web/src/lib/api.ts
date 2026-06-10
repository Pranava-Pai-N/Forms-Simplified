import type { Survey, SurveyPayload, User } from './types'

const apiFetch = async <T>(path: string, options: RequestInit = {}) => {
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.message ?? 'Unexpected API error')
  }

  return data as T
}

export const loginUser = (payload: { email: string; password: string }) =>
  apiFetch<{ success: boolean; message: string; user: User }>('/user/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const registerUser = (payload: { name: string; email: string; password: string }) =>
  apiFetch<{ success: boolean; message: string; user: User }>('/user/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const logoutUser = () =>
  apiFetch<{ success: boolean; message: string }>('/user/logout', {
    method: 'POST',
  })

export const getCurrentUser = () => apiFetch<{ success: boolean; user: User }>('/user/me')
export const getUserSurveys = () => apiFetch<{ success: boolean; surveys: Survey[] }>('/survey')

// Survey Routes

export const createSurvey = (payload: SurveyPayload) =>
  apiFetch<{ success: boolean; survey: Survey }>('/survey', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const getSurvey = (surveyId: string) =>
  apiFetch<{ success: boolean; survey: Survey }>(`/survey/${surveyId}`)

export const updateSurvey = (surveyId: string, payload: SurveyPayload) =>
  apiFetch<{ success: boolean; survey: Survey }>(`/survey/${surveyId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const getResponsesbySurveyId = (surveyId: string) =>
  apiFetch<{ success: boolean; survey: Survey; responseResult: any }>(
    `/survey/${surveyId}/responses`,
  )
