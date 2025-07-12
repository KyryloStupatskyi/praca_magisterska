import { Module } from '@nestjs/common'
import { MessagesModule } from 'src/messages/messages.module'
import { WebsocketConnectionGateway } from './websocket-connection.gateway'

@Module({
  providers: [WebsocketConnectionModule],
  imports: [MessagesModule],
  exports: [WebsocketConnectionGateway],
})
export class WebsocketConnectionModule {}
