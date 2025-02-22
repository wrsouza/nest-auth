import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { randomUUID } from 'node:crypto';

export class RolePermissionsDto {
  @ApiProperty({
    type: [String],
    examples: [randomUUID()],
  })
  @IsArray()
  permissions: string[];
}
