import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { WssJoinRoomDto } from './dto/wss-join-room.dto'
import { WssSendMessageDto } from './dto/wss-send-message.dto'
import { UseGuards } from '@nestjs/common'
import { WssAuthGuard } from 'src/common/guards/wss.isAuth.guard'
import { RedisService } from 'src/redis/redis.service'
import { v4 as uuidv4 } from 'uuid'
import { MessagesModel } from 'src/messages/messages.model'

@UseGuards(WssAuthGuard)
@WebSocketGateway({
  cors: true,
})
export class WebsocketConnectionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private redisService: RedisService) {}

  @WebSocketServer()
  server: Server

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id} ${client.handshake.address}`)
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('join-room')
  userJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() wssJoinRoomDto: WssJoinRoomDto
  ) {
    socket.join(wssJoinRoomDto.roomId.toString())
    console.log(`: client ${socket.id} joined room ${wssJoinRoomDto.roomId}`)

    this.server.to(wssJoinRoomDto.roomId.toString()).emit('user-joined', {
      user: socket.id,
    })
  }

  @SubscribeMessage('send-template-message')
  async sendTemplateMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() wssSendMessageDto: WssSendMessageDto
  ) {
    const tempMessageId = uuidv4()

    const tempMessagesObj = {
      templateId: tempMessageId,
      message: wssSendMessageDto.message,
      roomId: wssSendMessageDto.roomId,
      messageSenderId: socket.data.user.id,
      createdAt: new Date(),
      updateAt: new Date(),
      status: 'template' as const,
    }

    this.server
      .to(wssSendMessageDto.roomId.toString())
      .emit('recieve-template-message', {
        messageObj: tempMessagesObj,
      })

    await this.redisService.addToRedis(tempMessagesObj)
  }

  sendOriginalMessages(
    allMessagesArr: Promise<MessagesModel[]>,
    uniqueRoomsArr: number[]
  ) {
    uniqueRoomsArr.forEach(async (roomId) => {
      const messagesForRoom = (await allMessagesArr).filter(
        (item) => item.roomId === roomId
      )

      this.server.to(roomId.toString()).emit('recieve-original-messages', {
        messages: messagesForRoom,
        status: 'original',
      })
    })
  }
}
