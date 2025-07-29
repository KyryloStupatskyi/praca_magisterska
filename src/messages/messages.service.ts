import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { MessagesModel } from './messages.model'
import { RedisAllMessagesDto } from 'src/redis/dto/redis-messages.dto'

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(MessagesModel) private messageModel: typeof MessagesModel
  ) {}

  // async saveMessage(
  //   message: string,
  //   messageSenderId: number,
  //   roomId: number
  // ): Promise<MessagesModel> {
  //   try {
  //     return await this.messageModel.create({
  //       message,
  //       messageSenderId,
  //       roomId,
  //     })
  //   } catch (err) {
  //     throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
  //   }
  // }

  async getMessages(roomId: number): Promise<MessagesModel[]> {
    return await this.messageModel.findAll({
      where: { roomId },
      include: { all: true },
      order: [['createdAt', 'ASC']],
    })
  }

  async bulkSaveMessages(
    messages: RedisAllMessagesDto[]
  ): Promise<MessagesModel[]> {
    const CHUNK_SIZE = 2000

    const allSavedMessages: MessagesModel[] = []

    try {
      for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
        const chunk = messages.slice(i, i + CHUNK_SIZE)

        const saved = await this.messageModel.bulkCreate(chunk)

        if (!saved || saved.length === 0) {
          throw new Error(`Chunk ${i / CHUNK_SIZE} failed to save`)
        }

        allSavedMessages.push(...saved)
      }

      return allSavedMessages
    } catch (error) {
      throw new Error(
        `Failed to save messages to database: ${error.message ?? 'unknown'}`
      )
    }
  }
}
