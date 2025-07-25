import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common'
import { EventSourceService } from './event-source.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { CustomResponse } from 'src/common/types/customResponse.type'
import { Request } from 'express'
import { SendMesssageDto } from 'src/longpolling/dto/sendMessage.dto'
import { TokensService } from 'src/tokens/tokens.service'
import { User } from 'src/user/user.model'
import { UserDecorator } from 'src/common/decorators/getUser.decorator'
import { TokenPayloadDto } from 'src/tokens/dto/token-payload.dto'
import { v4 as uuidv4 } from 'uuid'
import { RedisService } from 'src/redis/redis.service'

@Controller('event-source')
export class EventSourceController {
  constructor(
    private eventSourceService: EventSourceService,
    private eventEmitter: EventEmitter2,
    private tokenService: TokensService,
    private redisService: RedisService
  ) {}

  @Get()
  connect(
    @Req() request: Request,
    @Res() response: CustomResponse,
    @Query('roomId') roomId: string,
    @Query('token') token: string
  ) {
    try {
      const decodeToken: User | null =
        this.tokenService.validateAccessToken(token)

      this.eventSourceService.subscribeMessages(+roomId, response)

      request.on('close', () => {
        if (decodeToken) {
          this.eventSourceService.deleteConnectionOne(+roomId, decodeToken.id)
        }
      })
    } catch (error) {
      return new HttpException('Unauthorize', HttpStatus.UNAUTHORIZED)
    }
  }

  @Post('send-template-message')
  async sendMessage(
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
