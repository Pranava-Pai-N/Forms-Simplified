import { connectDB } from '../lib/database'

const createSurvey = async (content: any) => {
  try {
    const body = await content.req.json()

    const user = content.get('user')

    const { title, description, coverImage, primaryColor, questions } = body

    if (
      !title ||
      !coverImage ||
      !primaryColor ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return content.json(
        {
          success: false,
          message: 'Please provide valid survey data.',
        },
        400,
      )
    }

    const prisma = connectDB(content.env.HYPERDRIVE)

    const survey = await prisma.survey.create({
      data: {
        title,
        description,
        coverImage,
        primaryColor,
        answeredCount: 0,
        creator: {
          connect: { id: user.id },
        },
        questions: {
          create: questions.map((question: any, index: number) => ({
            id: question.id,
            text: question.text,
            type: question.type,
            isRequired: question.isRequired ?? true,
            order: question.order ?? index,
            options: question.options ?? [],
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return content.json({ success: true, survey }, 201)
  } catch (error) {
    console.error(error)
    return content.json(
      {
        success: false,
        message: 'Error creating survey.',
      },
      500,
    )
  }
}

const getUserSurveys = async (content: any) => {
  try {
    const user = content.get('user')
    const id = user.id
    const prisma = connectDB(content.env.HYPERDRIVE)

    const userSurveys = await prisma.user.findUnique({
      where: { id },
      include: {
        createdSurveys: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return content.json(
      {
        success: true,
        message: 'All surveys created by user retrieved successfully',
        surveys: userSurveys?.createdSurveys ?? [],
      },
      200,
    )
  } catch (error) {
    return content.json(
      {
        success: false,
        message: `Error fetching surveys, ${error} `,
      },
      500,
    )
  }
}

const getSurveyById = async (content: any) => {
  try {
    const surveyId = content.req.param('id')

    if (!surveyId) {
      return content.json(
        {
          success: false,
          message: 'Please provide a valid survey id.',
        },
        400,
      )
    }

    const prisma = connectDB(content.env.HYPERDRIVE)

    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!survey) {
      return content.json(
        {
          success: false,
          message: 'Survey not found.',
        },
        404,
      )
    }

    return content.json({ success: true, survey }, 200)
  } catch (error) {
    console.error(error)
    return content.json(
      {
        success: false,
        message: 'Error fetching survey.',
      },
      500,
    )
  }
}

const updateSurvey = async (content: any) => {
  try {
    const surveyId = content.req.param('id')

    const user = content.get('user')

    const body = await content.req.json()

    if (!surveyId) {
      return content.json(
        {
          success: false,
          message: 'Please provide a valid survey id.',
        },
        400,
      )
    }

    const { title, description, coverImage, primaryColor, questions } = body

    if (!title || !coverImage || !primaryColor || !Array.isArray(questions)) {
      return content.json(
        {
          success: false,
          message: 'Please provide valid survey data.',
        },
        400,
      )
    }

    const prisma = connectDB(content.env.HYPERDRIVE)

    const existingSurvey = await prisma.survey.findUnique({
      where: { id: surveyId },
    })

    if (!existingSurvey) {
      return content.json(
        {
          success: false,
          message: 'Survey not found.',
        },
        404,
      )
    }

    if (existingSurvey.creatorId !== user.id) {
      return content.json(
        {
          success: false,
          message: 'Unauthorized to update this survey.',
        },
        403,
      )
    }

    const survey = await prisma.survey.update({
      where: { id: surveyId },
      data: {
        title,
        description,
        coverImage,
        primaryColor,
        questions: {
          deleteMany: {},
          create: questions.map((question: any, index: number) => ({
            id: question.id,
            text: question.text,
            type: question.type,
            isRequired: question.isRequired ?? true,
            order: question.order ?? index,
            options: question.options ?? [],
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return content.json({ success: true, survey }, 200)
  } catch (error) {
    console.error(error)
    return content.json(
      {
        success: false,
        message: 'Error updating survey.',
      },
      500,
    )
  }
}

const surveyResponsesbyId = async (content: any) => {
  const surveyId = content.req.param('id')

  if (!surveyId) {
    return content.json(
      {
        success: false,
        message: 'Please provide a valid survey Id...',
      },
      400,
    )
  }
  const prisma = connectDB(content.env.HYPERDRIVE)

  try {
    const survey = await prisma.survey.findUnique({
      where: {
        id: surveyId,
      },

      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            answers: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!survey) {
      return content.json(
        {
          success: false,
          message: 'Survey not found ..',
        },
        404,
      )
    }

    const responses: Record<string, any> = {}

    survey.questions.forEach((question) => {
      question.answers.forEach((ans) => {
        const userId = ans.user.id

        if (!responses[userId]) {
          responses[userId] = {
            user: ans.user,
            answers: [],
          }
        }

        responses[userId].answers.push({
          questionId: question.id,
          question: question.text,
          type: question.type,
          value: ans.value,
        })
      })
    })

    const responseResult = Object.values(responses)

    return content.json({
      success: true,
      survey: {
        id: survey.id,
        title: survey.title,
      },
      responseResult,
    })
  } catch (error) {
    console.error(error)
    return content.json(
      {
        success: false,
        message: `Something went wrong. Please try again later, ${error}`,
      },
      500,
    )
  }
}

const surveyControllers = {
  createSurvey,
  getUserSurveys,
  getSurveyById,
  updateSurvey,
  surveyResponsesbyId,
}

export default surveyControllers
