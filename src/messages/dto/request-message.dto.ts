import { MessagesModel } from '../messages.model'

export class RequestMessageDto {
  readonly message: string
  readonly roomId: number
  readonly templateId: number
}
