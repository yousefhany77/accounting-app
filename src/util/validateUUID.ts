import { HttpError } from '../middleware/errorHandler'
import { UUID } from './shared/schema'

export const isValidUUID = (id: string) => {
  const isValidId = UUID.safeParse(id)
  if (!isValidId.success) {
    throw new HttpError('BAD_REQUEST', isValidId.error.errors.map((e) => e.message).join(', '))
  }
  return true
}
