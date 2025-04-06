import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { RolesService } from './roles.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { Roles } from './roles.model'

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post()
  createRole(@Body() roleDto: CreateRoleDto): Promise<Roles> {
    return this.rolesService.createRole(roleDto)
  }

  @Get('/get-all')
  getAllRoles(): Promise<Roles[]> {
    return this.rolesService.getAllRoles()
  }

  @Get('/:value')
  getRoleByValue(@Param('value') value: string): Promise<Roles> {
    return this.rolesService.getRoleByValue(value)
  }
}
