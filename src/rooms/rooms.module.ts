import { Module } from '@nestjs/common'
import { RoomsService } from './rooms.service'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from 'src/user/user.model'
import { RoomsModel } from './rooms.model'
import { Rooms_Users } from './rooms-user.model'
import { UserModule } from 'src/user/user.module'
import { RoomsController } from './rooms.controller'
import { TokensModule } from 'src/tokens/tokens.module'
import { MessagesModel } from 'src/messages/messages.model'

@Module({
  providers: [RoomsService],
  imports: [
    SequelizeModule.forFeature([User, RoomsModel, Rooms_Users, MessagesModel]),
    UserModule,
    TokensModule,
  ],
  controllers: [RoomsController],
  exports: [RoomsService],
})
export class RoomsModule {}
