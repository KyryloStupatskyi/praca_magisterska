import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from 'src/user/user.model'
import { Tokens } from './tokens.model'
import { TokenPayloadDto } from './dto/token-payload.dto'
import { RefreshTokenRecordDto } from './dto/refresh-token-record.dto'
import { GenerateJwtTokensTypes } from 'src/common/types/jwt-types/generate-jwt-tokens.types'

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

  validateRefreshToken(token: string): User | null {
    try {
      const user = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      })
      return user
    } catch (e) {
      return null
    }
  }

  validateAccessToken(token: string): User | null {
    try {
      const user = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      })
      return user
    } catch (e) {
      return null
    }
  }

  async decodeToken(token: string): Promise<TokenPayloadDto> {
    const decoded = this.jwtService.decode(token)
    return decoded
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

  async getToken(token: string): Promise<Tokens | null> {
    const tokenDb = await Tokens.findOne({ where: { refreshToken: token } })

    return tokenDb
  }

  async removeToken(token: string): Promise<void> {
    const isDelete = await Tokens.destroy({ where: { refreshToken: token } })

    if (isDelete === 0) {
      throw new Error('Token not found')
    }
  }
}
