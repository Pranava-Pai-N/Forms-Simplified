export type QuestionType = 'short_text' | 'rating' | 'multiple_choice'

export type Question = {
  id: string
  text: string
  type: QuestionType
  isRequired: boolean
  order: number
  options?: string[] | null
}

export type Survey = {
  id: string
  title: string
  description: string | null
  coverImage: string
  primaryColor: string
  creatorId: string
  isPublished: boolean
  answeredCount: number
  createdAt: string
  questions: Question[]
  shortId: string
}

export type SurveyPayload = {
  title: string
  description?: string
  coverImage: string
  primaryColor: string
  questions: Question[]
}

export type SurveyAnswer = {
  id: string
  questionId: string
  userId: string | null
  value: string
  createdAt: Date
}

export type User = {
  id: string
  name: string
  email: string
  profileImage: string
  createdAt: Date
  createdSurveys: Survey[]
  answers: SurveyAnswer[]
}
