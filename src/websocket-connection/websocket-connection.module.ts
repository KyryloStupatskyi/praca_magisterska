import { Module } from '@nestjs/common'
import { MessagesModule } from 'src/messages/messages.module'

@Module({
  providers: [WebsocketConnectionModule],
  imports: [MessagesModule],
})
export class WebsocketConnectionModule {}
