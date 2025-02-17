import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export class AuthResponseDto {
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
    type: String,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken?: string;

  constructor(data: User, accessToken?: string) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.accessToken = accessToken;
  }
}
