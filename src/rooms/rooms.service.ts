import { HttpException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { RoomsModel } from './rooms.model'
import { UserService } from 'src/user/user.service'
import { TokenPayloadDto } from 'src/tokens/dto/token-payload.dto'
import { User } from 'src/user/user.model'

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(RoomsModel) private roomsModel: typeof RoomsModel,
    private userService: UserService
  ) {}

  async createRoom(userId: number, friendId: number): Promise<RoomsModel> {
    const userObj: User = await this.userService.getUserById(userId)
    const friendObj: User = await this.userService.getUserById(friendId)

    const roomTitle: string = friendObj.email + ', ' + userObj.email

    const room: RoomsModel = await this.roomsModel.create({
      title: roomTitle,
    })

    await room.$add('users', [userObj.id, friendId])

    return room
  }

  async getAllUserRooms(userId: number) {
    const rooms: RoomsModel[] = await this.roomsModel.findAll({
      include: {
        model: User,
        where: { id: userId },
      },
    })

    return rooms
  }
}
