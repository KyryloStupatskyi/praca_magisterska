import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { CustomResponse } from 'src/common/types/customResponse.type'
import { MessagesModel } from 'src/messages/messages.model'
import { MessagesService } from 'src/messages/messages.service'

@Injectable()
export class EventSourceService {
  constructor(private messageService: MessagesService) {}

  private connections: Map<number, CustomResponse[]> = new Map()

  addNewConnection(roomId: number, userResponse: CustomResponse) {
    const checkConnection: CustomResponse[] | undefined =
      this.connections.get(roomId)

    if (checkConnection) {
      this.connections.set(roomId, [...checkConnection, userResponse])
    } else {
      this.connections.set(roomId, [userResponse])
    }
  }

  deleteConnectionOne(roomId: number, userId: number): void {
    const checkConnection: CustomResponse[] | undefined =
      this.connections.get(roomId)

    if (checkConnection && userId) {
      this.connections.set(
        roomId,
        checkConnection.filter((item) => item.responseUserId !== userId)
      )
    } else {
      this.connections.delete(roomId)
    }
  }

  sendMessagesToExistingConnections(roomId: number, message: MessagesModel[]) {
    const checkConnection: CustomResponse[] | undefined =
      this.connections.get(roomId)

    if (checkConnection && checkConnection.length) {
      const payload = {
        status: 'original',
        message,
      }
      const data = `data: ${JSON.stringify(payload)} \n\n`

      checkConnection.forEach((response) => {
        response.write(data)
      })
    }
  }

  subscribeMessages(roomId: number, userResponse: CustomResponse) {
    userResponse.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })

    userResponse.write(`: connected\n\n`)

    this.addNewConnection(+roomId, userResponse)
  }

  @OnEvent('event-source.sendOriginalMessages')
  private async notification(
    allMessagesArr: Promise<MessagesModel[]>,
    uniqueRoomsArr: number[]
  ) {
    try {
      uniqueRoomsArr.forEach(async (roomId) => {
        const messagesForRoom = (await allMessagesArr).filter(
          (item) => item.roomId === roomId
        )

        this.sendMessagesToExistingConnections(roomId, messagesForRoom)
      })
    } catch (err) {
      console.error('Failed to process message:', err)
    }
  }
}
