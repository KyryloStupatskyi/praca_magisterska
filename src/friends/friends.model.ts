import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript'
import { FriendStatusEnum } from 'src/common/enums/friends-status.enum'
import { User } from 'src/user/user.model'

interface FriendsRequiredAttr {
  reqFromUserId: number
  reqToUserId: number
  status?: FriendStatusEnum
}

@Table({ tableName: 'friends' })
export class Friends extends Model<Friends, FriendsRequiredAttr> {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare reqFromUserId: number

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare reqToUserId: number

  @Column({
    type: DataType.ENUM(...Object.values(FriendStatusEnum)),
    allowNull: false,
    defaultValue: FriendStatusEnum.PENDING,
  })
  declare status: FriendStatusEnum

  @BelongsTo(() => User, 'reqFromUserId')
  requester: User

  @BelongsTo(() => User, 'reqToUserId')
  addressee: User
}
