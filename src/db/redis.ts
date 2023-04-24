import Redis from 'ioredis'

let redisClient: Redis

const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis()
  }

  return redisClient
}

const redis = getRedisClient()
export default redis
