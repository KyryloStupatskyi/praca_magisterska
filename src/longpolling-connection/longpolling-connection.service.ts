import { Injectable } from '@nestjs/common'
import { CustomResponse } from 'src/common/types/customReponse/custom-response.types'

@Injectable()
export class LongpollingConnectionService {
  private connections: Map<string, CustomResponse[]> = new Map()

  createNewConnection(key: string, value: CustomResponse): void {
    const checkConnection: any = this.connections.get(key)

    if (checkConnection) {
      this.connections.set(key, [...checkConnection, value])
    } else {
      this.connections.set(key, [value])
    }
  }

  deleteConnectionOne(key: string, responseId?: string): void {
    const checkConnection: CustomResponse[] | undefined =
      this.connections.get(key)

    if (responseId && checkConnection) {
      this.connections.set(
        key,
        checkConnection.filter((item) => item.id !== Number(responseId))
      )
    } else if (checkConnection) {
      this.connections.delete(key)
    }
  }

  sendMessagesToExistingConnections(key: string, message: string) {
    const checkConnection: CustomResponse[] | undefined = this.connections.get(
      String(key)
    )

    if (checkConnection && checkConnection.length) {
      checkConnection.forEach((response) => {
        response.status(200).json({
          message: message,
        })
      })
    }
  }
}
