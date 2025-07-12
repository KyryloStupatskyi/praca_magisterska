import { InjectRedis } from '@nestjs-modules/ioredis'
import { Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { RedisAllMessagesDto } from './dto/redis-messages.dto'

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async addToRedis(messageObj: RedisAllMessagesDto): Promise<void> {
    const key = `room:${messageObj.roomId}`

    await this.redis.lpush(key, JSON.stringify(messageObj))

    const redisTtl = await this.redis.ttl(key)

    if (redisTtl === -1) await this.redis.expire(key, 30)
  }

  async getMessagesToOneRoom(roomId: number): Promise<string[] | null> {
    const messages = await this.redis.lrange(`room:${roomId}`, 0, -1)

    if (messages.length === 0) return null

    return messages.map((item) => JSON.parse(item))
  }

  async getAllRedisMessages(): Promise<
    Record<string, RedisAllMessagesDto[]> | undefined
  > {
    const messages: Record<string, RedisAllMessagesDto[]> = {}

    const redisPipline = this.redis.pipeline()
    const keys = await this.redis.keys('room:*')

    if (keys.length === 0) return {}

    keys.forEach((item) => {
      redisPipline.lrange(item, 0, -1)
    })

    const results = await redisPipline.exec()

    if (results === null || results.length === 0) return {}

    results.forEach(([error, result], index) => {
      if (error) {
        console.log(
          `Error fetching messages for ${keys[index]}:`,
          error.message
        )
        messages[keys[index]] = []
      } else {
        messages[keys[index]] = (result as string[]).map((item) =>
          JSON.parse(item)
        )
      }
    })

    return messages
  }
}
