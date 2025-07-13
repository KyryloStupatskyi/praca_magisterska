import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { Observable } from 'rxjs'
import { Socket } from 'socket.io'
import { TokensService } from 'src/tokens/tokens.service'

@Injectable()
export class WssAuthGuard implements CanActivate {
  constructor(private tokensService: TokensService) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToWs().getClient<Socket>()

    try {
      const token = request.handshake.auth.token.split(' ')[1]

      if (!token) {
        throw new WsException({
          message: 'Unauthorize, please login!',
          status: HttpStatus.UNAUTHORIZED,
        })
      }

      const user = this.tokensService.validateAccessToken(token)

      if (!user) {
        throw new WsException({
          message: 'Unauthorize, please login!',
          status: HttpStatus.UNAUTHORIZED,
        })
      }

      request.data.user = user

      return true
    } catch (error: unknown) {
      throw new WsException({
        message: 'Unautthorize, please login!',
        status: HttpStatus.UNAUTHORIZED,
      })
    }
  }
}
