import { ErrorRequestHandler } from 'express'

export const errorsMap = {
  '400': 'Bad Request',
  '401': 'Unauthorized',
  '403': 'Forbidden',
  '404': 'Not Found',
  '405': 'Method Not Allowed',
  '429': 'Too Many Requests',
  '500': 'Internal Server Error',
} as const

export const errorMapValues = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  UNKNOWN_ERROR: 500,
} as const
// somehow this middleware doesn't work without the next parameter
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  const statusCode = (err.statusCode as keyof typeof errorsMap) || '500'
  const title = err.title ?? errorsMap[statusCode] ?? 'Unknown Error'
  const message = err.message || 'Something went wrong'
  res.status(Number(statusCode)).json({ title, statusCode, message, metaData: err.metaData })
}

type ErrorMapValues = keyof typeof errorMapValues
export class HttpError extends Error {
  statusCode: number

  constructor(statusCode: ErrorMapValues, message: string) {
    super(message)
    this.statusCode = errorMapValues[statusCode]
  }
}
