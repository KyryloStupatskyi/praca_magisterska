import { Module } from '@nestjs/common'
import { LongpollingController } from './longpolling.controller'
import { LongpollingService } from './longpolling.service'
import { LongpollingConnectionModule } from 'src/longpolling-connection/longpolling-connection.module'

@Module({
  controllers: [LongpollingController],
  providers: [LongpollingService],
  imports: [LongpollingConnectionModule],
})
export class LongpollingModule {}
