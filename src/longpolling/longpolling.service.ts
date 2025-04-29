import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { Response } from 'express'
import { LongpollingConnectionService } from 'src/longpolling-connection/longpolling-connection.service'
import { MessagesService } from 'src/messages/messages.service'

@Injectable()
export class LongpollingService {
  constructor(
    private lpConnection: LongpollingConnectionService,
    private messagesService: MessagesService
  ) {}

  createConnection(roomId: number, userResponse: Response): void {
    this.lpConnection.createNewConnection(roomId, userResponse)
  }

  removeConnection(roomId: number): void {
    this.lpConnection.deleteConnectionOne(roomId)
  }

  sendMessagesToConnections(roomId: number, message: string): void {
    return this.lpConnection.sendMessagesToExistingConnections(roomId, message)
  }

  @OnEvent('longpolling.sendMessage')
  private notification(roomId: number, message: string, userId: number) {
    this.messagesService.saveMessage(message, userId, roomId)
    return this.sendMessagesToConnections(roomId, message)
  }
}
