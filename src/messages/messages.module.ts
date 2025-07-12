import { Module } from '@nestjs/common'
import { MessagesController } from './messages.controller'
import { MessagesService } from './messages.service'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from 'src/user/user.model'
import { MessagesModel } from './messages.model'
import { RoomsModel } from 'src/rooms/rooms.model'
import { TokensModule } from 'src/tokens/tokens.module'
import { RedisModule } from 'src/redis/redis.module'

@Module({
  imports: [
    SequelizeModule.forFeature([User, MessagesModel, RoomsModel]),
    TokensModule,
    RedisModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
