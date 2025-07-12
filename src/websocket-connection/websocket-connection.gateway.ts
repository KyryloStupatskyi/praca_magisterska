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
import { MessagesService } from 'src/messages/messages.service'
import { UseGuards } from '@nestjs/common'
import { WssAuthGuard } from 'src/common/guards/wss.-isAuth.guard'
import { RedisAllMessagesDto } from 'src/redis/dto/redis-messages.dto'
import { RedisService } from 'src/redis/redis.service'
import uuid from 'uuid'

@UseGuards(WssAuthGuard)
@WebSocketGateway({
  cors: true,
})
export class WebsocketConnectionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private messagesService: MessagesService,
    private redisService: RedisService
  ) {}

  @WebSocketServer()
  server: Server

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`)
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

  @SubscribeMessage('send-message')
  async sendMessages(
    @ConnectedSocket() socket: Socket,
    @MessageBody() wssSendMessageDto: WssSendMessageDto
  ) {
    const createdMessage = await this.messagesService.saveMessage(
      wssSendMessageDto.message,
      socket.data.user.id,
      wssSendMessageDto.roomId
    )

    this.server
      .to(wssSendMessageDto.roomId.toString())
      .emit('recieve-message', {
        message: createdMessage,
      })
  }

  @SubscribeMessage('send-template-message')
  async sendTemplateMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() wssSendMessageDto: WssSendMessageDto
  ) {
    const tempMessageId = uuid.v4()

    const tempMessagesObj = {
      templateId: tempMessageId,
      message: wssSendMessageDto.message,
      roomId: wssSendMessageDto.roomId,
      messageSenderId: socket.data.user.id,
      createdAt: new Date(),
      updateAt: new Date(),
      status: 'template' as const,
    }

    this.server.emit('recieve-template-message', {
      messageObj: tempMessagesObj,
    })

    await this.redisService.addToRedis(tempMessagesObj)
  }

  sendOriginalMessages(
    allMessagesArr: RedisAllMessagesDto[],
    uniqueRoomsArr: number[]
  ) {
    uniqueRoomsArr.forEach((roomId) => {
      const messagesForRoom = allMessagesArr.filter(
        (item) => item.roomId === roomId
      )

      this.server.to(roomId.toString()).emit('recieve-original-messages', {
        messages: messagesForRoom,
        status: 'original',
      })
    })
  }
}
