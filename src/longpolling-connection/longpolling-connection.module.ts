import { Module } from '@nestjs/common'
import { LongpollingConnectionService } from './longpolling-connection.service'

@Module({
  providers: [LongpollingConnectionService],
  exports: [LongpollingConnectionService],
})
export class LongpollingConnectionModule {}
