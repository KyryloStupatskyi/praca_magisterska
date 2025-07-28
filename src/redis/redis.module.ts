import { Module } from '@nestjs/common'
import { RedisService } from './redis.service'
import { RedisModule as RdModule } from '@nestjs-modules/ioredis'

@Module({
  imports: [
    RdModule.forRoot({
      type: 'single',
      url: 'redis://redis:6379',
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
