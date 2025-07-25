import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { CustomResponse } from 'src/common/types/customResponse.type'
import { LongpollingConnectionService } from 'src/longpolling-connection/longpolling-connection.service'
import { MessagesModel } from 'src/messages/messages.model'

@Injectable()
export class LongpollingService {
  constructor(private lpConnection: LongpollingConnectionService) {}

  getConnections() {
    return this.lpConnection.getConnections()
  }

  createConnection(roomId: number, userResponse: CustomResponse): void {
    this.lpConnection.createNewConnection(roomId, userResponse)
  }

  removeConnection(roomId: number, userId: number): void {
    this.lpConnection.deleteConnectionOne(roomId, userId)
  }

  sendMessagesToConnections(roomId: number, message: MessagesModel[]): void {
    return this.lpConnection.sendMessagesToExistingConnections(roomId, message)
  }

  @OnEvent('longpolling.sendOriginalMessages')
  private async notification(
    allMessagesArr: Promise<MessagesModel[]>,
    uniqueRoomsArr: number[]
  ) {
    try {
      uniqueRoomsArr.forEach(async (roomId) => {
        const messagesForRoom = (await allMessagesArr).filter(
          (item) => item.roomId === roomId
        )

        this.sendMessagesToConnections(roomId, messagesForRoom)
      })
    } catch (err) {
      console.error('Failed to process message:', err)
    }
  }
}
