import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Roles } from './roles.model'
import { CreateRoleDto } from './dto/create-role.dto'

@Injectable()
export class RolesService {
  constructor(@InjectModel(Roles) private rolesModel: typeof Roles) {}

  async createRole(roleDto: CreateRoleDto): Promise<Roles | HttpException> {
    const checkIfRoleExist = await this.rolesModel.findOne({
      where: { value: roleDto.value },
    })

    if (checkIfRoleExist) {
      return new HttpException(
        'Role with this name already exists',
        HttpStatus.BAD_REQUEST
      )
    }

    const role = await this.rolesModel.create(roleDto)

    return role
  }

  async getAllRoles(): Promise<Roles[] | HttpException> {
    const roles = await this.rolesModel.findAll()

    if (roles.length === 0) {
      return new HttpException(
        'No roles yet, please create it first!',
        HttpStatus.NOT_FOUND
      )
    }

    return roles
  }

  async getRoleByValue(value: string): Promise<Roles | HttpException> {
    const role = await this.rolesModel.findOne({ where: { value } })

    if (!role) {
      return new HttpException('Role is not found', HttpStatus.NOT_FOUND)
    }

    return role
  }
}
