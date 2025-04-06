import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript'
import { User } from 'src/user/user.model'

@Table({ tableName: 'tokens' })
export class Tokens extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  })
  declare id: number

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  declare userId: number

  @Column({ type: DataType.TEXT, allowNull: false })
  declare refreshToken: string

  @BelongsTo(() => User)
  user: User
}
