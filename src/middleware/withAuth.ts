import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { TokenStore } from '../util/tokenStore'
import { HttpError } from './errorHandler'

export const tokenStore = new TokenStore(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN)

export const withAuth = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies['accessToken'] as string

  if (!accessToken) {
    throw new HttpError('UNAUTHORIZED', 'No token provided')
  }
  jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET_KEY, async (err) => {
    if (err) {
      clearCookies(res)
      throw new HttpError('FORBIDDEN', `Invalid token: ${err?.message}`)
    }
    const storedToken = await tokenStore.getToken(accessToken)
    if (!storedToken) {
      clearCookies(res)
      throw new HttpError('FORBIDDEN', `Invalid token: Token doesn't exist`)
    }

    req.user = storedToken
    next()
  })
}

const clearCookies = (res: Response) => {
  res.cookie('accessToken', '', { httpOnly: true, path: '/', maxAge: 0 })
}
