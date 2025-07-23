import { InjectRedis } from '@nestjs-modules/ioredis'
import { Injectable, Logger } from '@nestjs/common'
import Redis from 'ioredis'
import { RedisAllMessagesDto } from './dto/redis-messages.dto'

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  private readonly logger = new Logger(RedisService.name)

  async addToRedis(messageObj: RedisAllMessagesDto): Promise<void> {
    const key = `room:${messageObj.roomId}`
    await this.redis.lpush(key, JSON.stringify(messageObj))

    // U should to test it, i mean the time, when messsages can die in Redis

    // const ttl = await this.redis.ttl(key)
    // if (ttl === -1) {
    //   await this.redis.expire(key, 30) // ключ живет 30 сек без обновлений
    // }
  }

  async getAllMessagesToOneRoomAndClearKey(
    roomId: number
  ): Promise<RedisAllMessagesDto[]> {
    const key = `room:${roomId}`
    const pipeline = this.redis.pipeline()

    pipeline.lrange(key, 0, -1)
    pipeline.ltrim(key, 1, 0)

    const execResult = await pipeline.exec()

    if (execResult === null) {
      this.logger.error(`Pipeline failed for key ${key}`)
      return []
    }

    const [[lrangeError, lrangeResult], [errorTrim]] = execResult

    if (lrangeError) {
      this.logger.error(`Lrange error for ${key}: ${lrangeError.message}`)
      return []
    }

    if (errorTrim) {
      this.logger.error(`Ltrim error for ${key}: ${errorTrim.message}`)
    }

    if (!Array.isArray(lrangeResult) || lrangeResult.length === 0) return []

    return lrangeResult.map((item: string) => JSON.parse(item))
  }

  async fetchAllRedisMessages(): Promise<
    Record<number, RedisAllMessagesDto[]>
  > {
    const keys = await this.redis.keys('room:*')
    const messagesByRoom: Record<number, RedisAllMessagesDto[]> = {}

    for (const key of keys) {
      const roomId = Number(key.split(':')[1])
      const messages = await this.getAllMessagesToOneRoomAndClearKey(roomId)
      if (messages.length > 0) {
        messagesByRoom[roomId] = messages
      }
    }

    return messagesByRoom
  }
}
