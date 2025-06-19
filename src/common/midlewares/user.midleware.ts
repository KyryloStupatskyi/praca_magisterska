import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { JwtService } from '@nestjs/jwt'
import { TokenPayloadDto } from 'src/tokens/dto/token-payload.dto'

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}
  async use(request: Request, response: Response, next: NextFunction) {
    try {
      const token: string | undefined =
        request.headers.authorization?.split(' ')[1]

      if (!token) {
        throw new HttpException('Unauthorize', HttpStatus.UNAUTHORIZED)
      }

      const decodedToken: TokenPayloadDto = await this.jwtService.verify(
        token,
        {
          secret: process.env.JWT_ACCESS_SECRET,
        }
      )

      if (!decodedToken) {
        throw new HttpException('Unauthorize', HttpStatus.UNAUTHORIZED)
      }

      request['user'] = decodedToken
      response['responseUserId'] = decodedToken.id

      next()
    } catch (error) {
      console.log(error)
      next(new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED))
    }
  }
}
