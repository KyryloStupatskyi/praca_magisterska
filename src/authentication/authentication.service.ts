import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { UserService } from 'src/user/user.service'
import { TokensService } from 'src/tokens/tokens.service'
import { CreateUserDto } from 'src/user/dto/create-user.dto'
import { TokenPayloadDto } from 'src/tokens/dto/token-payload.dto'
import { GenerateJwtTokensTypes } from 'src/types/jwt-types/generate-jwt-tokens.types'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthenticationService {
  constructor(
    private userService: UserService,
    private tokensService: TokensService
  ) {}

  /*
    If have time, i can add transaction to authService, to role back if something goes wrong
  */

  async registration(userDto: CreateUserDto): Promise<GenerateJwtTokensTypes> {
    const candidate = await this.userService.getUserByEmail(userDto.email)

    if (candidate) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.BAD_REQUEST
      )
    }

    const saltRounds = process.env.HASH_SALT_ROUNDS || 5
    const hashPass = await bcrypt.hash(userDto.password, Number(saltRounds))

    const user = await this.userService.createUser({
      ...userDto,
      password: hashPass,
    })

    const tokenPayload = new TokenPayloadDto(user)

    const tokens = this.tokensService.generateTokens({
      ...tokenPayload,
    })

    await this.tokensService.saveRefreshToken({
      userId: user.id,
      refreshToken: tokens.refreshToken,
    })

    return tokens
  }

  async login(userDto: CreateUserDto): Promise<GenerateJwtTokensTypes> {
    /*
      I dont know why, but User.findOne() return user with no roles obj, so i cant use somthing like user.roles, but in fact, if i test
      it with postman, i get user with roles, dombshit, so i need to use user.get(). Need to find out why it happens!

      Mayby user.get() is the best way and mainly correct way to do this?
    */
    const user = await this.userService.getUserByEmail(userDto.email)

    if (!user) {
      throw new HttpException(
        'User with this email not found',
        HttpStatus.BAD_REQUEST
      )
    }

    const userObj = user.get()

    const comparePassword = await bcrypt.compare(
      userDto.password,
      userObj.password
    )

    if (!comparePassword) {
      throw new HttpException(
        'Incorrect email or password',
        HttpStatus.UNAUTHORIZED
      )
    }

    const tokenPayload = new TokenPayloadDto(userObj)

    const tokens = this.tokensService.generateTokens({
      ...tokenPayload,
    })

    await this.tokensService.saveRefreshToken({
      userId: userObj.id,
      refreshToken: tokens.refreshToken,
    })

    return tokens
  }

  async refresh(refreshToken: string) {
    const validateToken = this.tokensService.validateToken(refreshToken)
    const tokenDb = await this.tokensService.getToken(refreshToken)

    if (!validateToken || !tokenDb) {
      throw new HttpException('User is not authorized', HttpStatus.UNAUTHORIZED)
    }

    const user = await this.userService.getUserById(validateToken.id)
    const userObj = user.get()

    const tokenPayload = new TokenPayloadDto(userObj)

    const tokens = this.tokensService.generateTokens({
      ...tokenPayload,
    })

    await this.tokensService.saveRefreshToken({
      userId: userObj.id,
      refreshToken: tokens.refreshToken,
    })

    return tokens
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokensService.removeToken(refreshToken)
  }
}
