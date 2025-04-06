import { Roles } from 'src/roles/roles.model'
import { User } from 'src/user/user.model'

export class TokenPayloadDto {
  readonly id: number
  readonly email: string
  readonly roles: Roles[]

  constructor(user: User) {
    this.id = user.id
    this.email = user.email
    this.roles = user.userRoles
  }
}
