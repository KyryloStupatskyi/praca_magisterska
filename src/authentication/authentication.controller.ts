import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthenticationService } from './authentication.service'
import { Request, Response } from 'express'
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

  @Get('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const refreshToken = request.signedCookies.refreshToken

    if (!refreshToken) {
      throw new UnauthorizedException('User not authorized')
    }

    const tokens = await this.authService.refresh(refreshToken)

    response.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      signed: true,
    })

    return {
      accessToken: tokens.accessToken,
    }
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const refreshToken = request.signedCookies.refreshToken

    if (!refreshToken) {
      throw new UnauthorizedException('User not authorized')
    }

    await this.authService.logout(refreshToken)

    response.clearCookie('refreshToken', {
      httpOnly: true,
      signed: true,
    })

    return {
      message: 'Logout successful',
    }
  }
}
