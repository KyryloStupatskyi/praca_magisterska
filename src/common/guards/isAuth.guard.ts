import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { TokensService } from 'src/tokens/tokens.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private tokensService: TokensService) {}
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    try {
      const isExist: string | undefined = request.headers.authorization
      const token: string = request.headers.authorization.split(' ')[1]

      if (!isExist || !token) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
      }

      const decodeToken = this.tokensService.validateAccessToken(token)

      request.user = decodeToken
      return true
    } catch (error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED)
    }
  }
}
