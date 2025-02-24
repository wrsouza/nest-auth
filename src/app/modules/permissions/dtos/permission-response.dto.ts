import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export class PermissionResponseDto {
  @ApiProperty({
    type: String,
    example: randomUUID(),
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'user-list',
  })
  name: string;

  @ApiProperty({
    type: String,
    example: 'List users',
  })
  description: string;

  @ApiProperty({
    type: Date,
    example: Date.now(),
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    example: Date.now(),
  })
  updatedAt: Date;

  constructor(data: Permission) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
