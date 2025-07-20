import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { CustomResponse } from 'src/common/types/customResponse.type'
import { LongpollingConnectionService } from 'src/longpolling-connection/longpolling-connection.service'
import { MessagesModel } from 'src/messages/messages.model'
import { MessagesService } from 'src/messages/messages.service'

@Injectable()
export class LongpollingService {
  constructor(
    private lpConnection: LongpollingConnectionService,
    private messagesService: MessagesService
  ) {}

  getConnections() {
    return this.lpConnection.getConnections()
  }

  createConnection(roomId: number, userResponse: CustomResponse): void {
    this.lpConnection.createNewConnection(roomId, userResponse)
  }

  removeConnection(roomId: number, userId: number): void {
    this.lpConnection.deleteConnectionOne(roomId, userId)
  }

  sendMessagesToConnections(roomId: number, message: MessagesModel): void {
    return this.lpConnection.sendMessagesToExistingConnections(roomId, message)
  }

  // @OnEvent('longpolling.sendMessage')
  // private async notification(roomId: number, message: string, userId: number) {
  //   try {
  //     const createdMessage = await this.messagesService.saveMessage(
  //       message,
  //       userId,
  //       roomId
  //     )
  //     this.sendMessagesToConnections(roomId, createdMessage)
  //   } catch (err) {
  //     console.error('Failed to process message:', err)
  //   }
  // }
}
