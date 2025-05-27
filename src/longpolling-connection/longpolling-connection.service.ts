import { Injectable } from '@nestjs/common'
import { Response } from 'express'
import { CustomResponse } from 'src/common/types/customResponse.type'
import { MessagesModel } from 'src/messages/messages.model'

@Injectable()
export class LongpollingConnectionService {
  private connections: Map<number, CustomResponse[]> = new Map()

  createNewConnection(roomId: number, userResponse: CustomResponse): void {
    const checkConnection: CustomResponse[] | undefined =
      this.connections.get(roomId)

    if (userResponse.timeoutId) {
      clearTimeout(userResponse.timeoutId)
    }

    const timeout = setTimeout(() => {
      this.deleteConnectionOne(roomId, userResponse.responseUserId)
      userResponse.status(200).json({ timeout: true })
    }, 30000)

    userResponse.timeoutId = timeout

    if (checkConnection) {
      this.connections.set(roomId, [...checkConnection, userResponse])
    } else {
      this.connections.set(roomId, [userResponse])
    }
  }

  deleteConnectionOne(roomId: number, userId: number): void {
    const checkConnection: CustomResponse[] | undefined =
      this.connections.get(roomId)

    if (!checkConnection) return

    const filteredConnections = checkConnection.filter((item) => {
      if (item.responseUserId === userId) {
        if (item.timeoutId) {
          clearTimeout(item.timeoutId)
        }
        return false
      }
      return true
    })

    if (filteredConnections && userId) {
      this.connections.set(roomId, filteredConnections)
    } else {
      this.connections.delete(roomId)
    }
  }

  sendMessagesToExistingConnections(roomId: number, message: MessagesModel) {
    const checkConnection: CustomResponse[] | undefined =
      this.connections.get(roomId)

    if (checkConnection && checkConnection.length) {
      checkConnection.forEach((response) => {
        response.status(200).json({ message: message })
        this.deleteConnectionOne(roomId, response.responseUserId)
      })
    }
  }
}
