import redis from '../db/redis'

export type DecodedToken = Record<string, unknown> & {
  userId: string
  name: string
  email: string
}
const time = {
  s: (n: number) => n * 1000,
  m: (n: number) => n * 60 * 1000,
  h: (n: number) => n * 60 * 60 * 1000,
  d: (n: number) => n * 24 * 60 * 60 * 1000,
}
export const convertToMilliseconds = (ttl: string) => {
  const valueUnit = ttl.split('')
  const value = valueUnit.slice(0, valueUnit.length - 1).join('')
  const unit = valueUnit[valueUnit.length - 1]
  if (!time[unit as keyof typeof time]) throw new Error(`Invalid time unit ${unit}`)
  return time[unit as keyof typeof time](Number(value))
}
export class TokenStore {
  private readonly ttl: number
  private readonly redis = redis
  constructor(ttl: number | string) {
    this.redis = redis
    if (typeof ttl === 'string') {
      ttl = convertToMilliseconds(ttl)
    }
    this.ttl = ttl
  }
  async setToken(token: string, data: DecodedToken): Promise<void> {
    const res = await this.redis.setex(token, this.ttl, JSON.stringify(data))
    if (res !== 'OK') throw new Error('Failed to set token')
  }

  async getToken(token: string): Promise<DecodedToken | undefined> {
    const decodedToken = await this.redis.get(token)
    if (!decodedToken) return undefined
    return JSON.parse(decodedToken) as DecodedToken
  }

  async deleteToken(token: string): Promise<void> {
    const res = await redis.del(token)
    if (res !== 1) throw new Error('Failed to delete token')
  }
}
