import { ZodError } from 'zod'

export const enhanceZodErrorMessage = (error: ZodError) => {
  const errorsKeys = Object.keys(error.flatten().fieldErrors)
  const errorsValues = Object.values(error.flatten().fieldErrors)
  return errorsKeys.map((key, index) => `${key}: ${errorsValues[index]}`)
}
