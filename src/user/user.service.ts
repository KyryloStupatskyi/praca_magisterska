import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { InjectModel } from '@nestjs/sequelize'
import { User } from './user.model'
import { RolesService } from 'src/roles/roles.service'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private rolesService: RolesService
  ) {}

  async createUser(userDto: CreateUserDto): Promise<User | HttpException> {
    const candidate = await this.userModel.findOne({
      where: { email: userDto.email },
    })

    if (candidate) {
      return new HttpException(
        'User with this email already exists',
        HttpStatus.BAD_REQUEST
      )
    }

    const role = await this.rolesService.getRoleByValue('USER')

    if (role instanceof HttpException) {
      return role
    }

    const user = await this.userModel.create({ ...userDto })
    await user.$set('roles', [role.id])
    user.roles = [role]

    return user
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.userModel.findAll({ include: { all: true } })
    return users
  }
}
