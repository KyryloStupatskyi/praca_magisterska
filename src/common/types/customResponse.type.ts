import { Response } from 'express'

export interface CustomResponse extends Response {
  responseUserId: number
  timeoutId: NodeJS.Timeout | null
}
