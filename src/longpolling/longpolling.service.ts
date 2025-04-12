import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { CustomResponse } from 'src/common/types/customReponse/custom-response.types'
import { LongpollingConnectionService } from 'src/longpolling-connection/longpolling-connection.service'

@Injectable()
export class LongpollingService {
  constructor(private lpConnection: LongpollingConnectionService) {}

  createConnection(id: string, response: CustomResponse): void {
    this.lpConnection.createNewConnection(id, response)
  }

  removeConnection(id: string, responseId?: string): void {
    this.lpConnection.deleteConnectionOne(id, responseId)
  }

  sendMessagesToConnections(key: string, message: string): void {
    return this.lpConnection.sendMessagesToExistingConnections(key, message)
  }

  @OnEvent('longpolling.sendMessage')
  private notification(userId: string, message: string) {
    return this.sendMessagesToConnections(userId, message)
  }
}
