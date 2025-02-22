import { ApiProperty } from '@nestjs/swagger';
import { Permission, Role } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export class RoleResponseDto {
  @ApiProperty({
    type: String,
    example: randomUUID(),
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'supervisor',
  })
  name: string;

  @ApiProperty({
    type: String,
    example: 'Supervisor role',
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

  @ApiProperty({
    type: [String],
    example: [randomUUID()],
  })
  permissions?: string[];

  constructor(data: Role & { permissions?: Permission[] }) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.updatedAt = data?.updatedAt;
    this.permissions = data.permissions?.map(
      (permission: Permission) => permission.id,
    );
  }
}
