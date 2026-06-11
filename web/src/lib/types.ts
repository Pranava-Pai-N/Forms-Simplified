export type QuestionType = 'short_text' | 'rating' | 'multiple_choice'

export type Question = {
  id: string
  text: string
  type: QuestionType
  isRequired: boolean
  order: number
  options?: string[]
}

export type Survey = {
  id: string
  title: string
  description: string | null
  coverImage: string
  primaryColor: string
  creatorId: string
  isPublished: boolean
  createdAt: string
  questions: Question[]
}

export type SurveyPayload = {
  title: string
  description?: string
  coverImage: string
  primaryColor: string
  questions: Question[]
}

export type User = {
  id: string
  name: string
  email: string
  profileImage: string
  createdAt: Date
  createdSurveys: Survey[]
  answers: SurveyPayload[]
}
