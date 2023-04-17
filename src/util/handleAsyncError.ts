import { Prisma } from '@prisma/client'
import { HttpError } from '../middleware/errorHandler'
import { prismaError } from './getPrismaErrorMessage'

/** Handle if the error is customHttp error or external Error */
export const handleAsyncError = (error: unknown) => {
  if (error instanceof HttpError) {
    throw error
  }
  // this will be handled by the errorHandler middleware in case of an unexpected error with prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    throw new prismaError(error)
  }
  if (error instanceof Error) {
    throw new Error(error.message)
  }
  throw new HttpError('INTERNAL_SERVER_ERROR', 'Something went wrong') // just in Case XD
}
