import { Module } from '@nestjs/common'
import { FriendsController } from './friends.controller'
import { FriendsService } from './friends.service'
import { SequelizeModule } from '@nestjs/sequelize'
import { Friends } from './friends.model'
import { User } from 'src/user/user.model'
import { JwtModule } from '@nestjs/jwt'
import { TokensModule } from 'src/tokens/tokens.module'

@Module({
  controllers: [FriendsController],
  providers: [FriendsService],
  imports: [SequelizeModule.forFeature([Friends, User]), TokensModule],
})
export class FriendsModule {}
