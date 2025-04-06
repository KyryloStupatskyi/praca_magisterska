import {
  BelongsToMany,
  Column,
  DataType,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript'
import { Roles } from 'src/roles/roles.model'
import { User_Roles } from 'src/roles/user-roles.model'
import { Tokens } from 'src/tokens/tokens.model'

interface UserRequiredAttr {
  email: string
  password: string
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserRequiredAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  })
  declare id: number

  @Column({ type: DataType.STRING, allowNull: false })
  declare email: string

  @Column({ type: DataType.STRING, allowNull: false })
  declare password: string

  @Column({ type: DataType.STRING, allowNull: true })
  declare avatarUrl: string

  @BelongsToMany(() => Roles, () => User_Roles)
  userRoles: Roles[]

  @HasOne(() => Tokens)
  refreshToken: Tokens
}
