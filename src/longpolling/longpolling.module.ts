import { Module } from '@nestjs/common'
import { LongpollingController } from './longpolling.controller'
import { LongpollingService } from './longpolling.service'
import { LongpollingConnectionModule } from 'src/longpolling-connection/longpolling-connection.module'
import { MessagesModule } from 'src/messages/messages.module'
import { LongpollingConnectionService } from 'src/longpolling-connection/longpolling-connection.service'

@Module({
  controllers: [LongpollingController],
  providers: [LongpollingService, LongpollingConnectionService],
  imports: [LongpollingConnectionModule, MessagesModule],
})
export class LongpollingModule {}
