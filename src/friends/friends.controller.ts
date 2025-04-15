import { Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { FriendsService } from './friends.service'
import { AuthGuard } from 'src/common/guards/isAuth.guard'
import { UserDecorator } from 'src/common/decorators/getUser.decorator'
import { TokenPayloadDto } from 'src/tokens/dto/token-payload.dto'

@UseGuards(AuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Post('add-friend')
  async addFriend(
    @Query() friendId: number,
    @UserDecorator() user: TokenPayloadDto
  ) {
    const userId = user.id
    return this.friendsService.addFriend(userId, friendId)
  }

  @Patch('accept')
  async acceptFriendRequest(
    @Query() friendId: number,
    @UserDecorator() user: TokenPayloadDto
  ) {
    const userId = user.id
    return this.friendsService.acceptFriendRequest(userId, friendId)
  }

  @Patch('reject')
  async rejectFriendRequest(
    @Query() friendId: number,
    @UserDecorator() user: TokenPayloadDto
  ) {
    const userId = user.id
    return this.friendsService.rejectFriendRequest(userId, friendId)
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
