import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { MessagesService } from './messages.service'
import { RedisService } from 'src/redis/redis.service'
import { WebsocketConnectionGateway } from 'src/websocket-connection/websocket-connection.gateway'

@Injectable()
export class MessagesCron {
  private readonly logger = new Logger(MessagesCron.name)
  constructor(
    private messagesService: MessagesService,
    private redisService: RedisService,
    private wssGateway: WebsocketConnectionGateway
  ) {}
  // Get messages from redis and save them to database every 5s
  // * seconds * minutes * hours * dayOfMonth * month * dayOfWeek
  @Cron('*/5 * * * * *')
  async saveMessagesToDataBase() {
    try {
      const messagesFromRedis = await this.redisService.getAllRedisMessages()

      if (messagesFromRedis === undefined) {
        return this.logger.debug('No messages found in Redis, waiting...')
      }

      const restoredArray = Object.values(messagesFromRedis).flat()

      const messages = this.messagesService.bulkSaveMessages(restoredArray)

      const uniqueRoomsId = [
        ...new Set(restoredArray.map((item) => item.roomId)),
      ]
      this.wssGateway.sendOriginalMessages(messages, uniqueRoomsId)

      for (const key of Object.keys(messagesFromRedis)) {
        await this.redisService.deleteRedisKey(key)
      }
    } catch (error) {
      console.error(
        'Something went wrong while saving messages to database:',
        error
      )
    }
  }
}
