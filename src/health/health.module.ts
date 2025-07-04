import { Module } from '@nestjs/common'
import { HealthController } from './health.controller'
import { TerminusModule } from '@nestjs/terminus'
import { RedisHealthModule } from '@nestjs-modules/ioredis'

@Module({
  imports: [TerminusModule, RedisHealthModule],
  controllers: [HealthController],
})
export class HealthModule {}
