import { Module } from '@nestjs/common'
import { FriendsController } from './friends.controller'
import { FriendsService } from './friends.service'
import { SequelizeModule } from '@nestjs/sequelize'
import { Friends } from './friends.model'
import { User } from 'src/user/user.model'
import { JwtModule } from '@nestjs/jwt'
import { TokensModule } from 'src/tokens/tokens.module'
import { RoomsModule } from 'src/rooms/rooms.module'
import { UserModule } from 'src/user/user.module'

@Module({
  controllers: [FriendsController],
  providers: [FriendsService],
  imports: [
    SequelizeModule.forFeature([Friends, User]),
    TokensModule,
    RoomsModule,
    UserModule,
  ],
})
export class FriendsModule {}
