import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.string({
    required_error: 'DATABASE_URL is required',
  }),
  JWT_ACCESS_TOKEN_SECRET_KEY: z.string({
    required_error: 'JWT_ACCESS_TOKEN_SECRET_KEY is required',
  }),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string({
    required_error: 'JWT_ACCESS_TOKEN_EXPIRES_IN is required',
  }),
  Frontend_URL: z.string({
    required_error: 'Frontend_URL is required',
  }),
  REDIS_URL: z.string({
    required_error: 'REDIS_URL is required',
  }),
})
export const validateEnv = () => envSchema.parse(process.env)
