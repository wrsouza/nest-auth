import { PartialType } from '@nestjs/swagger';
import { PermissionCreateDto } from './permission-create.dto';

export class PermissionUpdateDto extends PartialType(PermissionCreateDto) {}
