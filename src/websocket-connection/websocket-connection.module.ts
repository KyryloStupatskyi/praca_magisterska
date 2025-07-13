import { forwardRef, Module } from '@nestjs/common'
import { MessagesModule } from 'src/messages/messages.module'
import { WebsocketConnectionGateway } from './websocket-connection.gateway'
import { RedisModule } from 'src/redis/redis.module'
import { TokensModule } from 'src/tokens/tokens.module'

@Module({
  providers: [WebsocketConnectionGateway],
  imports: [forwardRef(() => MessagesModule), RedisModule, TokensModule],
  exports: [WebsocketConnectionGateway],
})
export class WebsocketConnectionModule {}
