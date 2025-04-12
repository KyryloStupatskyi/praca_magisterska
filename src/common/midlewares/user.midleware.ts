import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { JwtService } from '@nestjs/jwt'
import { TokenPayloadDto } from 'src/tokens/dto/token-payload.dto'

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}
  use(request: Request, response: Response, next: NextFunction) {
    const token: string | undefined =
      request.headers.authorization?.split(' ')[1]

    if (!token) {
      return response.status(401).json({ message: 'Unauthorized' })
    }

    const decodedToken: TokenPayloadDto = this.jwtService.verify(token, {
      secret: process.env.JWT_ACCESS_SECRET,
    })

    if (!decodedToken) {
      return response.status(401).json({ message: 'Unauthorized' })
    }

    request['user'] = decodedToken

    next()
  }
}
