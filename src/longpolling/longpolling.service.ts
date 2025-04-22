import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { Response } from 'express'
import { LongpollingConnectionService } from 'src/longpolling-connection/longpolling-connection.service'

@Injectable()
export class LongpollingService {
  constructor(private lpConnection: LongpollingConnectionService) {}

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
  private notification(roomId: number, message: string) {
    return this.sendMessagesToConnections(roomId, message)
  }
}
