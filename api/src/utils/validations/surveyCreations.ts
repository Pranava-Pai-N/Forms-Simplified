import { z } from 'zod'

export const questionSchema = z.object({
  id: z.string().optional().describe('Id associated with the question'),
  text: z.string().describe('Please enter question contents'),
  type: z.enum(['short_text', 'multiple_choice', 'rating']).describe('Question types'),
  isRequired: z.boolean().describe('Required or not').default(false),
  order: z.number().optional(),
  options: z.array(z.string()).describe('Option for the multiple choice questions').optional(),
})

export const surveyCreateSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'The title should be atleast 3 characters' })
    .describe('Please enter a survey title'),
  description: z.string().describe('Please enter survey description').optional(),
  coverImage: z.string().describe('Please add a survey image url'),
  primaryColor: z
    .string()
    .describe('Please select a primary color for the survey')
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: 'Please select a valid hex value as color',
    }),
  questions: z.array(questionSchema).describe('Questions of the survey'),
})
