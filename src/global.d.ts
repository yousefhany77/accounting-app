import { z } from 'zod'
import { envSchema } from './util/validateEnv'
import { Token } from './util/tokenStore'

export declare global {
  namespace Express {
    interface Request {
      user?: Token
    }
  }
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
