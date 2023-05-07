import { config } from 'dotenv'
import { NextFunction, Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import { TokenStore } from '../util/tokenStore'
import { HttpError } from './errorHandler'

config()
export const tokenStore = new TokenStore(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN)

export const withAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies['accessToken'] as string
  try {
    if (!accessToken) {
      throw new HttpError('UNAUTHORIZED', 'No token provided')
    }

    jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET_KEY)
    const storedToken = await tokenStore.getToken(accessToken)
    if (!storedToken) {
      throw new HttpError('FORBIDDEN', `Invalid token: Token doesn't exist`)
    }

    req.user = storedToken
  } catch (error) {
    clearCookies(res)
    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpError('UNAUTHORIZED', 'Token expired')
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpError('FORBIDDEN', error.message)
    }
    next(error)
  }
  next()
})

const clearCookies = (res: Response) => {
  res.cookie('accessToken', '', { httpOnly: true, path: '/', maxAge: 0 })
}
