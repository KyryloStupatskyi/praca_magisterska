import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { MessagesService } from './messages.service'
import { RedisService } from 'src/redis/redis.service'
import { WebsocketConnectionGateway } from 'src/websocket-connection/websocket-connection.gateway'

@Injectable()
export class MessagesCron {
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
      if (messagesFromRedis === undefined)
        return console.warn('Nothing to save to database!')

      const restoredArray = Object.values(messagesFromRedis).flat()

      this.messagesService.bulkSaveMessages(restoredArray)

      const uniqueRoomsId = [
        ...new Set(restoredArray.map((item) => item.roomId)),
      ]
      this.wssGateway.sendOriginalMessages(restoredArray, uniqueRoomsId)
    } catch (error) {
      console.error(
        'Something went wrong while saving messages to database:',
        error
      )
    }
  }
}
