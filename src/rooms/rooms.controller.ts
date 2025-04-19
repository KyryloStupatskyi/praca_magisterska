import { Controller, Get, UseGuards } from '@nestjs/common'
import { RoomsService } from './rooms.service'
import { AuthGuard } from 'src/common/guards/isAuth.guard'
import { UserDecorator } from 'src/common/decorators/getUser.decorator'
import { TokenPayloadDto } from 'src/tokens/dto/token-payload.dto'

@UseGuards(AuthGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Get()
  getRoomsBelongsToUser(@UserDecorator() user: TokenPayloadDto) {
    return this.roomsService.getAllUserRooms(user.id)
  }
}
