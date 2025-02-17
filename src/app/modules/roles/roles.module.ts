import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../config/database/database.module';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RoleRepository } from '../../repositories';

@Module({
  imports: [DatabaseModule],
  controllers: [RolesController],
  providers: [RolesService, RoleRepository],
})
export class RolesModule {}
