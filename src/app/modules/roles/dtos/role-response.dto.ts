import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export class RoleResponse {
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

  constructor(data: Role | any) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.updatedAt = data?.updatedAt;
  }
}
