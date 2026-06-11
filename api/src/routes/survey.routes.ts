import { Hono } from 'hono'
import surveyControllers from '../controllers/survey.controllers'
import authMiddleware from '../middlewares/auth.middleware'

type Bindings = {
  DB: D1Database
}

const surveyRoutes = new Hono<{ Bindings: Bindings }>()

surveyRoutes.post('/', authMiddleware, surveyControllers.createSurvey)
surveyRoutes.post('/:id/submit', surveyControllers.submitSurvey)
surveyRoutes.get('/:id/responses', authMiddleware, surveyControllers.getSurveyResponses)
surveyRoutes.get('/', authMiddleware, surveyControllers.getUserSurveys)
surveyRoutes.get('/:id/responses', authMiddleware, surveyControllers.surveyResponsesbyId)
surveyRoutes.get('/:id', surveyControllers.getSurveyById)
surveyRoutes.put('/:id', authMiddleware, surveyControllers.updateSurvey)

export default surveyRoutes
