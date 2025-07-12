export class RedisAllMessagesDto {
  readonly message: string
  readonly roomId: number
  readonly templateId: string
  readonly messageSenderId: number
  readonly createdAt: Date
  readonly updateAt: Date
  readonly status: 'template' | 'original'
}
