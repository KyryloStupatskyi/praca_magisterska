import { Injectable } from '@nestjs/common'
import { CustomResponse } from 'src/common/types/customReponse/custom-response.types'

@Injectable()
export class LongpollingConnectionService {
  private connections: Map<number, CustomResponse[]> = new Map()

  createNewConnection(roomId: number, userResponse: CustomResponse): void {
    const checkConnection: CustomResponse[] | undefined =
      this.connections.get(roomId)

    if (checkConnection) {
      this.connections.set(roomId, [...checkConnection, userResponse])
    } else {
      this.connections.set(roomId, [userResponse])
    }
  }

  deleteConnectionOne(roomId: number, userId?: number): void {
    const checkConnection: CustomResponse[] | undefined =
      this.connections.get(roomId)

    if (roomId && checkConnection) {
      this.connections.set(
        roomId,
        checkConnection.filter((item) => item.id !== userId)
      )
    } else if (checkConnection) {
      this.connections.delete(roomId)
    }
  }

  sendMessagesToExistingConnections(roomId: number, message: string) {
    const checkConnection: CustomResponse[] | undefined =
      this.connections.get(roomId)

    if (checkConnection && checkConnection.length) {
      checkConnection.forEach((response) => {
        response.status(200).json({ message: message })
        this.deleteConnectionOne(roomId)
      })
    }
  }
}
