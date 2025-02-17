import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { randomUUID } from 'node:crypto';

export class UserRolesDto {
  @ApiProperty({
    type: [String],
    examples: [randomUUID()],
  })
  @IsArray()
  roles: string[];
}
