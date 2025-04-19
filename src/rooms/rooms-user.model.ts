import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript'
import { User } from 'src/user/user.model'
import { RoomsModel } from './rooms.model'

@Table({ tableName: 'rooms_user', createdAt: false, updatedAt: false })
export class Rooms_Users extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.NUMBER })
  declare userId: number

  @ForeignKey(() => RoomsModel)
  @Column({ type: DataType.NUMBER })
  declare roomId: number
}
