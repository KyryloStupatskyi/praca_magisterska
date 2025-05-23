import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { User } from './user.model'

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  createUser(@Body() userDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(userDto)
  }

  @Get('get-user')
  getUser(@Query('email') email: string): Promise<User | null> {
    return this.userService.getUserByEmail(email)
  }

  @Get('get-all')
  getAllUseres(): Promise<User[]> {
    return this.userService.getAllUsers()
  }
}
