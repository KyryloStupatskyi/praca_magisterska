import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { MessagesModel } from './messages.model'

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(MessagesModel) private messageModel: typeof MessagesModel
  ) {}

  async saveMessage(
    message: string,
    messageSenderId: number,
    roomId: number
  ): Promise<MessagesModel> {
    try {
      return await this.messageModel.create({
        message,
        messageSenderId,
        roomId,
      })
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
    }
  }

  async getMessages(roomId: number): Promise<MessagesModel[]> {
    return await this.messageModel.findAll({
      where: { roomId },
      include: { all: true },
      order: [['createdAt', 'ASC']],
    })
  }
}
