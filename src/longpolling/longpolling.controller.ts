import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { UserDecorator } from 'src/common/decorators/getUser.decorator'
import { LongpollingService } from './longpolling.service'
import { TokenPayloadDto } from 'src/tokens/dto/token-payload.dto'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { SendMesssageDto } from './dto/sendMessage.dto'

@Controller('longpolling')
export class LongpollingController {
  constructor(
    private longpollingService: LongpollingService,
    private eventEmitter: EventEmitter2
  ) {}

  @Get()
  subscribe(
    @Req() request: Request,
    @Res() response: Response,
    @UserDecorator() user: TokenPayloadDto,
    @Query('roomId') roomId: string
  ) {
    this.longpollingService.createConnection(+roomId, response)

    request.on('close', () => {
      this.longpollingService.removeConnection(+roomId)
    })
  }

  @Post()
  sendMessage(@Body() messageObj: SendMesssageDto) {
    this.eventEmitter.emit(
      'longpolling.sendMessage',
      messageObj.roomId,
      messageObj.message
    )
    return {
      status: 'successfully sent message',
    }
  }
}
