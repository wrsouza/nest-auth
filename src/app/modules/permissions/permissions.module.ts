import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../config/database/database.module';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { PermissionRepository } from '../../repositories';

@Module({
  imports: [DatabaseModule],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionRepository],
})
export class PermissionsModule {}
