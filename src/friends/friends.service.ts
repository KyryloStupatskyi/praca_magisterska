import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Friends } from './friends.model'
import { InjectModel } from '@nestjs/sequelize'
import { FriendStatusEnum } from 'src/common/enums/friends-status.enum'
import { Op } from 'sequelize'

@Injectable()
export class FriendsService {
  constructor(@InjectModel(Friends) private friendsModel: typeof Friends) {}

  async addFriend(userId: number, friendId: number): Promise<Friends> {
    if (friendId === userId) {
      throw new Error('You cannot send a friend request to yourself')
    }

    const isFriendRequestExist = await this.friendsModel.findOne({
      where: {
        reqToUserId: friendId,
        reqFromUserId: userId,
      },
    })

    if (isFriendRequestExist) {
      throw new Error('Friend request already exists')
    }

    return this.friendsModel.create({
      reqFromUserId: userId,
      reqToUserId: friendId,
    })
  }

  async acceptFriendRequest(
    userId: number,
    friendId: number
  ): Promise<Friends> {
    const friendRequest = await this.friendsModel.findOne({
      where: {
        reqToUserId: userId,
        reqFromUserId: friendId,
        status: FriendStatusEnum.PENDING,
      },
    })

    if (!friendRequest) {
      throw new HttpException('Friend request not found', HttpStatus.NOT_FOUND)
    }

    friendRequest.status = FriendStatusEnum.ACCEPTED
    return await friendRequest.save()
  }

  async rejectFriendRequest(
    userId: number,
    friendId: number
  ): Promise<Friends> {
    const friendRequest = await this.friendsModel.findOne({
      where: {
        reqToUserId: userId,
        reqFromUserId: friendId,
        status: FriendStatusEnum.PENDING,
      },
    })

    if (!friendRequest) {
      throw new HttpException('Friend request not found', HttpStatus.NOT_FOUND)
    }

    friendRequest.status = FriendStatusEnum.REJECTED
    return await friendRequest.save()
  }

  async getAllRequests(userId: number): Promise<Friends[]> {
    const requests = await this.friendsModel.findAll({
      where: {
        reqToUserId: userId,
        status: FriendStatusEnum.PENDING,
      },
      include: {
        all: true,
      },
    })

    if (!requests) {
      throw new HttpException('No friend requests found', HttpStatus.NOT_FOUND)
    }

    return requests
  }

  async getAllFriends(userId: number): Promise<Friends[]> {
    const friends = await this.friendsModel.findAll({
      where: {
        [Op.or]: [
          { reqFromUserId: userId, status: FriendStatusEnum.ACCEPTED },
          { reqToUserId: userId, status: FriendStatusEnum.ACCEPTED },
        ],
      },
      include: {
        all: true,
      },
    })

    if (!friends) {
      throw new HttpException('No friends found', HttpStatus.NOT_FOUND)
    }

    return friends
  }
}
