import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript'
import { User } from 'src/user/user.model'
import { Roles } from './roles.model'

@Table({ tableName: 'user_roles', createdAt: false, updatedAt: false })
export class User_Roles extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.NUMBER })
  declare userId: number

  @ForeignKey(() => Roles)
  @Column({ type: DataType.NUMBER })
  declare roleId: number
}
