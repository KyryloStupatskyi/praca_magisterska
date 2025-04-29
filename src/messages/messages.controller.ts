import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { AuthGuard } from 'src/common/guards/isAuth.guard'

@UseGuards(AuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messageService: MessagesService) {}

  @Get()
  async getMessages(@Query('roomId') roomId: number) {
    return await this.messageService.getMessages(roomId)
  }
}
