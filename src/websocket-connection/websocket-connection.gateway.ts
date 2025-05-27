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

@UseGuards(WssAuthGuard)
@WebSocketGateway({
  cors: true,
})
export class WebsocketConnectionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private messagesService: MessagesService) {}

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
}
