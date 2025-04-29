import { Module } from '@nestjs/common'
import { LongpollingController } from './longpolling.controller'
import { LongpollingService } from './longpolling.service'
import { LongpollingConnectionModule } from 'src/longpolling-connection/longpolling-connection.module'
import { MessagesModule } from 'src/messages/messages.module'

@Module({
  controllers: [LongpollingController],
  providers: [LongpollingService],
  imports: [LongpollingConnectionModule, MessagesModule],
})
export class LongpollingModule {}
