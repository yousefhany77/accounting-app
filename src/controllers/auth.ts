import bcrpyt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import prisma from '../db'
import { HttpError } from '../middleware/errorHandler'
import { tokenStore } from '../middleware/withAuth'
import { enhanceZodErrorMessage } from '../util/enhanceZodErrorMessage'
import { handleAsyncError } from '../util/handleAsyncError'
import { DecodedToken } from '../util/tokenStore'

const passwordSchema = (email: string) =>
  z
    .string()
    .min(8)
    .max(25)
    .refine((password) => {
      const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/
      const isValid = regex.test(password)
      if (!isValid) {
        throw new z.ZodError([
          {
            code: z.ZodIssueCode.custom,
            path: [],
            message:
              'Password must be 8 to 25 characters long  and contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
          },
        ])
      }
      return true
    })
    .refine((password) => {
      if (password === email) {
        throw new z.ZodError([
          {
            code: z.ZodIssueCode.custom,
            path: [],
            message: 'Password cannot be equal to the user email address',
          },
        ])
      }
      return true
    })

export const signJWT = async (user: DecodedToken) => {
  const accessToken = jwt.sign(user, process.env.JWT_ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  })
  await tokenStore.setToken(accessToken, user)
  return accessToken
}

export const login = async (email: string, password: string) => {
  email = email.toLowerCase() // sanitize email
  const loginSchema = z.object({
    email: z
      .string({
        required_error: 'Email is Required',
      })
      .email({
        message: 'Invalid email',
      }),
    password: z.string({
      required_error: 'Password is Required',
    }),
  })
  try {
    const data = loginSchema.safeParse({ email, password })
    if (!data.success) {
      const errors = enhanceZodErrorMessage(data.error)
      throw new HttpError('BAD_REQUEST', `Invalid data: ${errors.join(', ')}`)
    }
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    if (!user) throw new HttpError('UNAUTHORIZED', `user with email '${email}' does not exist`)
    const isPasswordValid = await bcrpyt.compare(password, user.password)
    if (!isPasswordValid) throw new HttpError('UNAUTHORIZED', `Invalid credentials`)
    const accessToken = await signJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
    })
    return {
      accessToken,
    }
  } catch (error) {
    handleAsyncError(error)
  }
}

export const register = async (regData: { email: string; password: string; name: string }) => {
  regData.email = regData.email.toLowerCase() // sanitize email
  try {
    const registerSchema = z.object({
      name: z.string({
        required_error: 'Name is Required',
      }),
      email: z
        .string({
          required_error: 'Email is Required',
        })
        .email({
          message: 'Invalid email',
        }),
      password: passwordSchema(regData.email),
    })
    const data = registerSchema.safeParse(regData)
    if (!data.success) {
      const errors = enhanceZodErrorMessage(data.error)
      throw new HttpError('BAD_REQUEST', `Invalid data: ${errors.join(', ')}`)
    }
    const hashedPassword = await bcrpyt.hash(regData.password, 10)
    const user = await prisma.user.create({
      data: {
        email: regData.email,
        password: hashedPassword,
        name: regData.name,
      },
    })
    const accessToken = await signJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
    })

    return {
      accessToken,
      user,
    }
  } catch (error) {
    handleAsyncError(error)
  }
}
