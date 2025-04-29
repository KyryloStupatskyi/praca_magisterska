import { Module } from '@nestjs/common'
import { MessagesController } from './messages.controller'
import { MessagesService } from './messages.service'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from 'src/user/user.model'
import { MessagesModel } from './messages.model'
import { RoomsModel } from 'src/rooms/rooms.model'

@Module({
  imports: [SequelizeModule.forFeature([User, MessagesModel, RoomsModel])],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
