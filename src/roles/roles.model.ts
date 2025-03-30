import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript'
import { User_Roles } from './user-roles.model'
import { User } from 'src/user/user.model'

interface RolesRequiredAttr {
  value: string
  description: string
}

@Table({ tableName: 'roles' })
export class Roles extends Model<Roles, RolesRequiredAttr> {
  @Column({ type: DataType.STRING, allowNull: false })
  declare value: string

  @Column({ type: DataType.STRING, allowNull: false })
  declare description: string

  @BelongsToMany(() => Roles, () => User_Roles)
  users: User[]
}
