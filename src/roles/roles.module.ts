import { Module } from '@nestjs/common'
import { RolesController } from './roles.controller'
import { RolesService } from './roles.service'
import { SequelizeModule } from '@nestjs/sequelize'
import { Roles } from './roles.model'

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [SequelizeModule.forFeature([Roles])],
  exports: [RolesService],
})
export class RolesModule {}
