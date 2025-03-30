import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UserModule } from './user/user.module'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from './user/user.model'
import { RolesModule } from './roles/roles.module'
import { Roles } from './roles/roles.model'
import { User_Roles } from './roles/user-roles.model'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      models: [User, Roles, User_Roles],
      autoLoadModels: true,
      synchronize: true,
    }),
    UserModule,
    RolesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
