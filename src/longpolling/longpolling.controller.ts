import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common'
import { Request } from 'express'
import { UserDecorator } from 'src/common/decorators/getUser.decorator'
import { LongpollingService } from './longpolling.service'
import { TokenPayloadDto } from 'src/tokens/dto/token-payload.dto'
import { SendMesssageDto } from './dto/sendMessage.dto'
import { CustomResponse } from 'src/common/types/customResponse.type'
import { v4 as uuidv4 } from 'uuid'
import { RedisService } from 'src/redis/redis.service'
import { MessagesModel } from 'src/messages/messages.model'

@Controller('longpolling')
export class LongpollingController {
  constructor(
    private longpollingService: LongpollingService,
    private redisService: RedisService
  ) {}

  @Get('connections')
  getConnections() {
    return this.longpollingService.getConnections()
  }

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

  @Post('send-template-message')
  async sendTemplateMessage(
    @Body() messageObj: SendMesssageDto,
    @UserDecorator() user: TokenPayloadDto
  ) {
    const tempMessageId = uuidv4()

    const tempMessagesObj = {
      templateId: tempMessageId,
      message: messageObj.message,
      roomId: messageObj.roomId,
      messageSenderId: user.id,
      createdAt: new Date(),
      updateAt: new Date(),
      status: 'template' as const,
    }

    await this.redisService.addToRedis(tempMessagesObj)

    return {
      messageObj: tempMessagesObj,
    }
  }
}
