import { Injectable } from '@nestjs/common'
import { Response } from 'express'

@Injectable()
export class LongpollingConnectionService {
  private connections: Map<number, Response[]> = new Map()

  createNewConnection(roomId: number, userResponse: Response): void {
    const checkConnection: Response[] | undefined = this.connections.get(roomId)

    if (checkConnection) {
      this.connections.set(roomId, [...checkConnection, userResponse])
    } else {
      this.connections.set(roomId, [userResponse])
    }
  }

  deleteConnectionOne(roomId: number): void {
    const checkConnection: Response[] | undefined = this.connections.get(roomId)

    if (checkConnection) {
      this.connections.delete(roomId)
    }
  }

  sendMessagesToExistingConnections(roomId: number, message: string) {
    const checkConnection: Response[] | undefined = this.connections.get(roomId)

    if (checkConnection && checkConnection.length) {
      checkConnection.forEach((response) => {
        response.status(200).json({ message: message })
        this.deleteConnectionOne(roomId)
      })
    }
  }
}
