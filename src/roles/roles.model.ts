import {
  BelongsToMany,
  Column,
  DataType,
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
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  })
  declare id: number

  @Column({ type: DataType.STRING, allowNull: false })
  declare value: string

  @Column({ type: DataType.STRING, allowNull: false })
  declare description: string

  @BelongsToMany(() => User, () => User_Roles)
  users: User[]
}
