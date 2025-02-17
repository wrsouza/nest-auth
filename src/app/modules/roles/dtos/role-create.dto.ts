import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class RoleCreateDto {
  @ApiProperty({
    type: String,
    example: 'supervisor',
  })
  @IsString()
  @Length(3, 50)
  name: string;

  @ApiProperty({
    type: String,
    example: 'Supervisor role',
  })
  @IsString()
  @Length(3, 255)
  description: string;
}
