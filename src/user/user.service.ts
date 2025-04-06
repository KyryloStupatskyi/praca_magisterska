import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { InjectModel } from '@nestjs/sequelize'
import { User } from './user.model'
import { RolesService } from 'src/roles/roles.service'
import { RolesTypes } from 'src/types/role-types/roles.types'
import { Roles } from 'src/roles/roles.model'
import { log } from 'console'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private rolesService: RolesService
  ) {}

  async createUser(userDto: CreateUserDto): Promise<User> {
    const candidate = await this.userModel.findOne({
      where: { email: userDto.email },
    })

    if (candidate) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.BAD_REQUEST
      )
    }

    const role = await this.rolesService.getRoleByValue(RolesTypes.USER)
    const user = await this.userModel.create({ ...userDto })

    await user.$set('userRoles', [role.id])
    user.userRoles = [role]

    return user
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({
      where: { email },
      include: { all: true },
    })

    return user
  }

  async getAllUsers() {
    const users = await this.userModel.findAll({
      include: { all: true },
    })

    if (users.length === 0) {
      throw new HttpException(
        'No users yet, please create it first!',
        HttpStatus.NOT_FOUND
      )
    }

    return users
  }
}
