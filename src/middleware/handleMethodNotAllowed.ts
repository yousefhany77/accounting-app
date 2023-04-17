import { HttpError } from './errorHandler'

export const handleMethodNotAllowed = (req: Request) => {
  throw new HttpError('METHOD_NOT_ALLOWED', `Method ${req.method} is not allowed for the requested resource.`)
}
