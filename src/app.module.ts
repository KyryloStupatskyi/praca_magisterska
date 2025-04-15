import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UserModule } from './user/user.module'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from './user/user.model'
import { RolesModule } from './roles/roles.module'
import { Roles } from './roles/roles.model'
import { User_Roles } from './roles/user-roles.model'
import { TokensModule } from './tokens/tokens.module'
import { Tokens } from './tokens/tokens.model'
import { AuthenticationModule } from './authentication/authentication.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { LongpollingModule } from './longpolling/longpolling.module'
import { LongpollingConnectionModule } from './longpolling-connection/longpolling-connection.module'
import { UserMiddleware } from './common/midlewares/user.midleware'
import { JwtModule } from '@nestjs/jwt'
import { FriendsModule } from './friends/friends.module'
import { Friends } from './friends/friends.model'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    JwtModule.register({}),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      models: [User, Roles, User_Roles, Tokens, Friends],
      autoLoadModels: true,
      synchronize: true,
    }),
    EventEmitterModule.forRoot({}),
    UserModule,
    RolesModule,
    TokensModule,
    AuthenticationModule,
    LongpollingModule,
    LongpollingConnectionModule,
    FriendsModule,
  ],
  controllers: [],
  providers: [UserMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('longpolling')
  }
}
