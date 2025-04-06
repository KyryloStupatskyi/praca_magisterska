import { Module } from '@nestjs/common'
import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'
import { UserModule } from 'src/user/user.module'
import { TokensModule } from 'src/tokens/tokens.module'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from 'src/user/user.model'

@Module({
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  imports: [SequelizeModule.forFeature([User]), UserModule, TokensModule],
})
export class AuthenticationModule {}
