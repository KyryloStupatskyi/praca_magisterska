import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { UserDecorator } from 'src/common/decorators/getUser.decorator'
import { LongpollingService } from './longpolling.service'
import { TokenPayloadDto } from 'src/tokens/dto/token-payload.dto'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { SendMesssageDto } from './dto/sendMessage.dto'
import { CustomResponse } from 'src/common/types/customResponse.type'

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
    @Query('roomId') roomId: string
  ) {
    this.longpollingService.createConnection(+roomId, response)

    request.on('close', () => {
      this.longpollingService.removeConnection(+roomId, response.responseUserId)
    })
  }

  @Post()
  sendMessage(
    @Body() messageObj: SendMesssageDto,
    @UserDecorator() user: TokenPayloadDto
  ) {
    this.eventEmitter.emit(
      'longpolling.sendMessage',
      messageObj.roomId,
      messageObj.message,
      user.id
    )
    return {
      status: 'successfully sent message',
    }
  }
}
