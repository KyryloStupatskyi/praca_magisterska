import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { GenerateJwtTokensTypes } from 'src/types/jwt-types/generate-jwt-tokens.types'
import { User } from 'src/user/user.model'
import { Tokens } from './tokens.model'
import { TokenPayloadDto } from './dto/token-payload.dto'
import { RefreshTokenRecordDto } from './dto/refresh-token-record.dto'

@Injectable()
export class TokensService {
  constructor(private jwtService: JwtService) {}

  generateTokens(payload: TokenPayloadDto): GenerateJwtTokensTypes {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '30m',
      secret: process.env.JWT_ACCESS_SECRET,
    })
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
      secret: process.env.JWT_REFRESH_SECRET,
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  validateToken(token: string): User {
    return this.jwtService.verify(token)
  }

  async saveRefreshToken(
    refreshTokenData: RefreshTokenRecordDto
  ): Promise<Tokens> {
    const checkToken = await Tokens.findOne({
      where: { userId: refreshTokenData.userId },
    })

    if (checkToken) {
      checkToken.refreshToken = refreshTokenData.refreshToken
      return await checkToken.save()
    }

    const data = await Tokens.create({
      userId: refreshTokenData.userId,
      refreshToken: refreshTokenData.refreshToken,
    })

    return data
  }
}
