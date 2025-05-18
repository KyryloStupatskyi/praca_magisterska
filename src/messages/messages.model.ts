import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript'
import { RoomsModel } from 'src/rooms/rooms.model'
import { User } from 'src/user/user.model'

interface MessagesRequiredAttr {
  message: string
  messageSenderId: number
  roomId: number
  isReaded?: boolean
}

@Table({ tableName: 'messages' })
export class MessagesModel extends Model<MessagesModel, MessagesRequiredAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  })
  declare id: number

  @Column({ type: DataType.STRING, allowNull: false })
  declare message: string

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare isReaded: boolean

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare messageSenderId: number

  @ForeignKey(() => RoomsModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare roomId: number

  @BelongsTo(() => User)
  sender: number

  @BelongsTo(() => RoomsModel)
  room: number
}
