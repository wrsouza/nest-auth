import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export class ProfileResponseDto {
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
    example: false,
  })
  isAdmin: boolean;

  @ApiProperty({
    type: [String],
    example: ['list:users'],
  })
  roles: string[];

  constructor(data: User & { roles: string[] }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.isAdmin = data.isAdmin;
    this.roles = data.roles;
  }
}
