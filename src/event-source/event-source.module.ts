import { Module } from '@nestjs/common'
import { EventSourceController } from './event-source.controller'
import { EventSourceService } from './event-source.service'
import { MessagesModule } from 'src/messages/messages.module'
import { TokensModule } from 'src/tokens/tokens.module'

@Module({
  controllers: [EventSourceController],
  providers: [EventSourceService],
  imports: [MessagesModule, TokensModule],
})
export class EventSourceModule {}
