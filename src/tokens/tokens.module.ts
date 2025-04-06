import { Module } from '@nestjs/common'
import { TokensService } from './tokens.service'
import { JwtModule } from '@nestjs/jwt'
import { Tokens } from './tokens.model'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from 'src/user/user.model'

@Module({
  imports: [
    JwtModule.register({}),
    SequelizeModule.forFeature([Tokens, User]),
    Tokens,
  ],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
