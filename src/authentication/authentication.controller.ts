import { Body, Controller, HttpException, Post, Res } from '@nestjs/common'
import { AuthenticationService } from './authentication.service'
import { response, Response } from 'express'
import { CreateUserDto } from 'src/user/dto/create-user.dto'

@Controller('authentication')
export class AuthenticationController {
  constructor(private authService: AuthenticationService) {}

  @Post('registration')
  async registration(
    @Body() authDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const tokens = await this.authService.registration(authDto)

    response.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      signed: true,
    })
    return {
      accessToken: tokens.accessToken,
    }
  }

  @Post('login')
  async login(
    @Body() authDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const tokens = await this.authService.login(authDto)

    response.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      signed: true,
    })

    return {
      accessToken: tokens.accessToken,
    }
  }
}
