import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common'
import { Request } from 'express'
import { UserDecorator } from 'src/common/decorators/getUser.decorator'
import { CustomResponse } from 'src/common/types/customReponse/custom-response.types'
import { LongpollingService } from './longpolling.service'
import { TokenPayloadDto } from 'src/tokens/dto/token-payload.dto'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Controller('longpolling')
export class LongpollingController {
  constructor(
    private longpollingService: LongpollingService,
    private eventEmitter: EventEmitter2
  ) {}

  @Get()
  subscribe(
    @Req() request: Request,
    @Res() response: CustomResponse,
    @UserDecorator() user: TokenPayloadDto
  ) {
    const userId = String(user.id)
    const connectionId: string = String(userId)

    this.longpollingService.createConnection(connectionId, response)

    request.on('close', () => {
      this.longpollingService.removeConnection(connectionId, userId)
    })
  }

  @Post()
  sendMessage(
    @UserDecorator() user: TokenPayloadDto,
    @Body() message: { message: string }
  ) {
    this.eventEmitter.emit('longpolling.sendMessage', user.id, message)
    return 'successfully sent message'
  }
}
