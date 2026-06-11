import { getCookie, setCookie } from 'hono/cookie'
import { nanoid } from 'nanoid'
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
        isPublished: false,
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

    const { title, description, coverImage, primaryColor, questions, isPublished } = body

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

    if (existingSurvey.isPublished) {
      return content.json(
        {
          success: false,
          message: 'This survey is published and cannot be modified.',
        },
        400,
      )
    }

    const survey = await prisma.survey.update({
      where: { id: surveyId },
      data: {
        title,
        description,
        coverImage,
        primaryColor,
        ...(isPublished !== undefined ? { isPublished: !!isPublished } : {}),
        questions: {
          deleteMany: {},
          create: questions.map((question: any, index: number) => {
            const rawOptions = Array.isArray(question.options) ? question.options : []

            return {
              text: question.text,
              type: question.type,
              isRequired: question.isRequired ?? true,
              order: question.order ?? index,
              options: rawOptions,
            }
          }),
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
        const userId = ans?.user?.id as string

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

const submitSurvey = async (content: any) => {
  try {
    const surveyId = content.req.param('id')
    const body = await content.req.json()

    if (!surveyId) {
      return content.json({ success: false, message: 'Please provide a valid survey id.' }, 400)
    }

    const authUser = content.get('user')
    const dbUserId = authUser?.id || null

    let trackerId = authUser?.id

    if (!trackerId) {
      trackerId = getCookie(content, 'guest_session_id')

      if (!trackerId) {
        trackerId = `guest_${nanoid(10)}`

        setCookie(content, 'guest_session_id', trackerId, {
          path: '/',
          secure: true,
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'Lax',
        })
      }
    }

    const { answers } = body

    if (!Array.isArray(answers) || answers.length === 0) {
      return content.json({ success: false, message: 'Please provide valid survey answers.' }, 400)
    }

    const prisma = connectDB(content.env.HYPERDRIVE)

    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: { questions: true },
    })

    if (!survey) {
      return content.json(
        { success: false, message: 'Survey not found. Please try again later ..' },
        400,
      )
    }

    if (!survey.isPublished) {
      return content.json(
        { success: false, message: 'Survey has to be published to be answered ...' },
        400,
      )
    }

    const targetQuestionIds = new Set(survey.questions.map((q) => q.id))

    const requiredQuestionIds = survey.questions
      .filter((q: any) => q.isRequired)
      .map((q: any) => q.id)

    const uniqueAnswersMap = new Map<string, string>()

    for (const ans of answers) {
      if (ans.questionId && ans.value !== undefined && ans.value !== null) {
        if (targetQuestionIds.has(ans.questionId)) {
          uniqueAnswersMap.set(ans.questionId, String(ans.value).trim())
        }
      }
    }

    const missingRequired = requiredQuestionIds.some((id: any) => {
      const val = uniqueAnswersMap.get(id)
      return !val || val.length === 0
    })

    if (missingRequired) {
      return content.json(
        { success: false, message: 'One or more required questions are missing answers.' },
        400,
      )
    }

    const existingSubmission = await prisma.surveyAnswer.findFirst({
      where: {
        question: { surveyId: surveyId },
        OR: [
          ...(dbUserId ? [{ userId: dbUserId }] : []),
          { value: { startsWith: `[track:${trackerId}]` } },
        ],
      },
    })

    const operations = []

    for (const [questionId, rawValue] of uniqueAnswersMap.entries()) {
      if (dbUserId) {
        operations.push(
          prisma.surveyAnswer.upsert({
            where: {
              questionId_userId: {
                questionId,
                userId: dbUserId,
              },
            },
            update: { value: rawValue },
            create: {
              questionId,
              userId: dbUserId,
              value: rawValue,
            },
          }),
        )
      } else {
        const databaseValue = `[track:${trackerId}] ${rawValue}`

        const oldGuestAnswer = await prisma.surveyAnswer.findFirst({
          where: {
            questionId,
            value: { startsWith: `[track:${trackerId}]` },
          },
        })

        if (oldGuestAnswer) {
          operations.push(
            prisma.surveyAnswer.update({
              where: { id: oldGuestAnswer.id },
              data: { value: databaseValue },
            }),
          )
        } else {
          operations.push(
            prisma.surveyAnswer.create({
              data: {
                questionId,
                userId: null,
                value: databaseValue,
              },
            }),
          )
        }
      }
    }

    operations.push(
      prisma.survey.update({
        where: { id: surveyId },
        data: {
          answeredCount: existingSubmission ? undefined : { increment: 1 },
        },
      }),
    )

    await prisma.$transaction(operations)

    return content.json({ success: true, message: 'Survey responses saved successfully.' }, 201)
  } catch (error) {
    console.error('Error submitting survey responses:', error)
    return content.json({ success: false, message: 'Error saving survey submission.' }, 500)
  }
}

const getSurveyResponses = async (content: any) => {
  try {
    const surveyId = content.req.param('id')
    const userId = content.get('user').id

    if (!surveyId) {
      return content.json({ success: false, message: 'Please provide a valid survey id.' }, 400)
    }

    const prisma = connectDB(content.env.HYPERDRIVE)

    const survey = await prisma.survey.findFirst({
      where: {
        id: surveyId,
      },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    })

    if (!survey) {
      return content.json({ success: false, message: 'Survey does not exists.' }, 400)
    }

    if (survey.creatorId !== userId) {
      return content.json(
        { success: false, message: 'You can view surveys created by you only...' },
        400,
      )
    }

    const sanitizedQuestions = survey.questions.map((question) => {
      const sanitizedAnswers = question.answers.map((ans) => {
        let cleanValue = ans.value
        let guestTrackerId: string | null = null

        if (ans.value.startsWith('[track:')) {
          const match = ans.value.match(/^\[track:(.+?)\]\s*(.*)$/)
          if (match) {
            guestTrackerId = match[1] as string
            cleanValue = match[2] as string
          }
        }

        return {
          id: ans.id,
          userId: ans.userId,
          guestId: guestTrackerId,
          value: cleanValue,
          createdAt: ans.createdAt,
        }
      })

      return {
        ...question,
        answers: sanitizedAnswers,
      }
    })

    const submissionsMap = new Map<string, Array<{ questionId: string; value: string }>>()

    for (const q of sanitizedQuestions) {
      for (const ans of q.answers) {
        const key = ans.userId || `guest_${ans.guestId}`

        if (!submissionsMap.has(key)) {
          submissionsMap.set(key, [])
        }

        submissionsMap.get(key)!.push({
          questionId: q.id,
          value: ans.value,
        })
      }
    }
    const responseResult = Array.from(submissionsMap.entries()).map(([subId, answersList]) => ({
      submissionId: subId,
      isGuest: subId.startsWith('guest_'),
      answers: answersList,
    }))

    return content.json(
      {
        success: true,
        survey: {
          ...survey,
          questions: sanitizedQuestions,
        },
        responseResult,
      },
      200,
    )
  } catch (error) {
    console.error('Error fetching survey data analytics:', error)
    return content.json(
      { success: false, message: 'Error retrieving survey response records.' },
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
  submitSurvey,
  getSurveyResponses,
}

export default surveyControllers
