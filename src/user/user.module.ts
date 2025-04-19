import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from './user.model'
import { RolesModule } from 'src/roles/roles.module'
import { RoomsModel } from 'src/rooms/rooms.model'
import { Rooms_Users } from 'src/rooms/rooms-user.model'

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    SequelizeModule.forFeature([User, RoomsModel, Rooms_Users]),
    RolesModule,
  ],
  exports: [UserService],
})
export class UserModule {}
