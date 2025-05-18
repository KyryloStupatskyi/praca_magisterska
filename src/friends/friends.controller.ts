import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { FriendsService } from './friends.service'
import { AuthGuard } from 'src/common/guards/isAuth.guard'
import { UserDecorator } from 'src/common/decorators/getUser.decorator'
import { TokenPayloadDto } from 'src/tokens/dto/token-payload.dto'
import { FriendIdDto } from './dto/friendId.dto'

@UseGuards(AuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Post('add-friend')
  async addFriend(
    @Body() friendEmail: FriendIdDto,
    @UserDecorator() user: TokenPayloadDto
  ) {
    return this.friendsService.addFriend(user, friendEmail.friendEmail)
  }

  @Patch('accept')
  async acceptFriendRequest(
    @Body() friendId: { friendId: number },
    @UserDecorator() user: TokenPayloadDto
  ) {
    return this.friendsService.acceptFriendRequest(user.id, friendId.friendId)
  }

  @Patch('reject')
  async rejectFriendRequest(
    @Body() friendId: { friendId: number },
    @UserDecorator() user: TokenPayloadDto
  ) {
    return this.friendsService.rejectFriendRequest(user.id, friendId.friendId)
  }

  @Get('get-requests')
  async getFriendsRequests(@UserDecorator() user: TokenPayloadDto) {
    const userId = user.id
    return this.friendsService.getAllRequests(userId)
  }

  @Get('get-friends')
  async getFriends(@UserDecorator() user: TokenPayloadDto) {
    const userId = user.id
    return this.friendsService.getAllFriends(userId)
  }
}
