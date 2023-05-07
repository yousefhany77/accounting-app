import { Prisma } from '@prisma/client'
import { prismaError } from 'prisma-better-errors'
import { ZodError } from 'zod'
import { HttpError } from '../middleware/errorHandler'

/** Handle if the error is customHttp error or external Error */
export const handleAsyncError = (error: unknown) => {
  if (error instanceof HttpError) {
    throw error
  }
  // this will be handled by the errorHandler middleware in case of an unexpected error with prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    throw new prismaError(error)
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new HttpError('BAD_REQUEST', 'Invalid data: ')
  }
  if (error instanceof ZodError) {
    throw new HttpError('BAD_REQUEST', error.issues.map((issue) => issue.message).join('\n'))
  }
  if (error instanceof Error) {
    throw new Error(error.message)
  }
  throw new HttpError('INTERNAL_SERVER_ERROR', 'Something went wrong') // just in Case XD
}
