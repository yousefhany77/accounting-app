import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { login, register } from '../controllers/auth'
import { HttpError } from '../middleware/errorHandler'
import { handleMethodNotAllowed } from '../middleware/handleMethodNotAllowed'
import { tokenStore } from '../middleware/withAuth'
import { convertToMilliseconds } from '../util/tokenStore'

export const authRouter = Router()

authRouter
  .route('/login')
  .post(
    asyncHandler(async (req, res) => {
      const { email, password } = req.body
      const tokens = await login(email, password)
      if (!tokens) throw new HttpError('UNAUTHORIZED', `Invalid credentials`) // this is not necessary the login function handles that, but it's for typeScript

      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        path: '/',
        maxAge: convertToMilliseconds(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN),
      })
      res.status(200).json({
        success: true,
        message: 'Login successful',
      })
    })
  )
  .all(handleMethodNotAllowed)

authRouter
  .route('/logout')
  .post(
    asyncHandler(async (req, res) => {
      const accessToken = req.cookies['accessToken']
      if (!accessToken) throw new HttpError('UNAUTHORIZED', `No token provided`)
      accessToken && (await tokenStore.deleteToken(accessToken))
      res.clearCookie('accessToken')
      req.user = undefined
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      })
    })
  )
  .all(handleMethodNotAllowed)

authRouter
  .route('/register')
  .post(
    asyncHandler(async (req, res) => {
      const { email, password, name } = req.body
      const tokens = await register({ email, password, name })
      if (!tokens) throw new HttpError('UNAUTHORIZED', `Invalid credentials`) // this is not necessary the login function handles that, but it's for typeScript
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        path: '/',
        maxAge: convertToMilliseconds(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN),
      })
      res.status(201).json({
        success: true,
        message: 'Registered successful',
      })
    })
  )
  .all(handleMethodNotAllowed)
