import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { CustomResponse } from 'src/common/types/customReponse/custom-response.types'
import { LongpollingConnectionService } from 'src/longpolling-connection/longpolling-connection.service'

@Injectable()
export class LongpollingService {
  constructor(private lpConnection: LongpollingConnectionService) {}

  createConnection(roomId: number, userResponse: CustomResponse): void {
    this.lpConnection.createNewConnection(roomId, userResponse)
  }

  removeConnection(roomId: number, userId: number): void {
    this.lpConnection.deleteConnectionOne(roomId, userId)
  }

  sendMessagesToConnections(roomId: number, message: string): void {
    return this.lpConnection.sendMessagesToExistingConnections(roomId, message)
  }

  @OnEvent('longpolling.sendMessage')
  private notification(roomId: number, message: string) {
    return this.sendMessagesToConnections(roomId, message)
  }
}
