import { config } from 'dotenv'
import Redis from 'ioredis'

let redisClient: Redis

const getRedisClient = (): Redis => {
  config()
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL)
  }

  return redisClient
}

const redis = getRedisClient()
export default redis
