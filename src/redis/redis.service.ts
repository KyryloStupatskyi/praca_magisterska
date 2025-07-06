import { InjectRedis } from '@nestjs-modules/ioredis'
import { Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { RequestMessageDto } from 'src/messages/dto/request-message.dto'

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async set(messageObj: RequestMessageDto): Promise<void> {
    await this.redis.set(
      messageObj.roomId.toString(),
      JSON.stringify(messageObj),
      'EX',
      30
    )
  }

  async getMessageByRoomId(roomId: number): Promise<string | null> {
    const stringMessage = await this.redis.get(roomId.toString())
    if (stringMessage) {
      return JSON.parse(stringMessage)
    }

    return null
  }

  async getAllUsersMessages(): Promise<string[] | undefined> {
    let cursos = '0'
    let keys: string[] = []
    let messages: string[] = []

    do {
      const [newCursor, elements] = await this.redis.scan(
        cursos,
        'MATCH',
        'user:*',
        'COUNT',
        100
      )
      cursos = newCursor
      keys.push(...elements)
    } while (cursos !== '0')

    if (keys.length === 0) return []

    const redisPipline = this.redis.pipeline()

    keys.forEach((key) => {
      redisPipline.get(key)
    })

    const result = await redisPipline.exec()

    if (result?.length === 0 || result === null) return []

    for (const [error, value] of result) {
      if (error) {
        throw new Error('Error fetching messages from Redis')
      }

      if (typeof value === 'string') {
        messages.push(value)
      }
    }

    return messages
  }
}
