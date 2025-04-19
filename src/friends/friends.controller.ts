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
    @Body() friendId: FriendIdDto,
    @UserDecorator() user: TokenPayloadDto
  ) {
    console.log(friendId)
    const userId = user.id
    return this.friendsService.addFriend(userId, friendId.friendId)
  }

  @Patch('accept')
  async acceptFriendRequest(
    @Body() friendId: FriendIdDto,
    @UserDecorator() user: TokenPayloadDto
  ) {
    const userId = user.id
    return this.friendsService.acceptFriendRequest(userId, friendId.friendId)
  }

  @Patch('reject')
  async rejectFriendRequest(
    @Body() friendId: FriendIdDto,
    @UserDecorator() user: TokenPayloadDto
  ) {
    const userId = user.id
    return this.friendsService.rejectFriendRequest(userId, friendId.friendId)
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
