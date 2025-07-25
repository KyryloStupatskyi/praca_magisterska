import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { MessagesService } from './messages.service'
import { RedisService } from 'src/redis/redis.service'
import { WebsocketConnectionGateway } from 'src/websocket-connection/websocket-connection.gateway'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class MessagesCron {
  private readonly logger = new Logger(MessagesCron.name)

  constructor(
    private readonly messagesService: MessagesService,
    private readonly redisService: RedisService,
    private readonly wssGateway: WebsocketConnectionGateway,
    private eventEmitter: EventEmitter2
  ) {}

  // Каждый 2 минуты
  @Cron('*/5 * * * * *')
  async saveMessagesToDatabase() {
    try {
      const messagesFromRedis = await this.redisService.fetchAllRedisMessages()

      if (!messagesFromRedis || Object.keys(messagesFromRedis).length === 0) {
        this.logger.debug('No messages to save — waiting...')
        return
      }

      const restoredArray = Object.values(messagesFromRedis).flat()
      const messages = this.messagesService.bulkSaveMessages(restoredArray)

      const uniqueRoomIds = [...new Set(restoredArray.map((msg) => msg.roomId))]
      //this.wssGateway.sendOriginalMessages(messages, uniqueRoomIds)

      this.eventEmitter.emit(
        'event-source.sendOriginalMessages',
        messages,
        uniqueRoomIds
      )

      // this.eventEmitter.emit(
      //   'longpolling.sendOriginalMessages',
      //   messages,
      //   uniqueRoomIds
      // )

      this.logger.log(`Saved ${restoredArray.length} messages to DB`)
    } catch (error) {
      this.logger.error('Error while saving messages from Redis to DB:', error)
    }
  }
}
