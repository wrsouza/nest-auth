import { ApiProperty } from '@nestjs/swagger';
import { User, Role } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export class UserResponseDto {
  @ApiProperty({
    type: String,
    example: randomUUID(),
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    type: String,
    example: 'john.doe@domain.com',
  })
  email: string;

  @ApiProperty({
    type: Boolean,
    example: 'false',
  })
  isAdmin: boolean;

  @ApiProperty({
    type: Boolean,
    example: 'false',
  })
  isActive: boolean;

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
  roles?: string[];

  constructor(data: User & { roles?: Role[] }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.isAdmin = data.isAdmin;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.roles = data.roles?.map((role: Role) => role.id);
  }
}
