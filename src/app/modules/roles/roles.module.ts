import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { PermissionRepository, RoleRepository } from '../../repositories';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RoleRepository, PermissionRepository],
})
export class RolesModule {}
