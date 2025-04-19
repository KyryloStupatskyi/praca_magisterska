import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript'
import { User } from 'src/user/user.model'
import { Rooms_Users } from './rooms-user.model'

interface RoomsRequiredAttr {
  title: string
}

@Table({ tableName: 'rooms' })
export class RoomsModel extends Model<RoomsModel, RoomsRequiredAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  })
  declare id: number

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string

  @BelongsToMany(() => User, () => Rooms_Users)
  users: User[]
}
