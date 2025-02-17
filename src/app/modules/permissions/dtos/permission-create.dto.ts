import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class PermissionCreateDto {
  @ApiProperty({
    type: String,
    example: 'user-list',
  })
  @IsString()
  @Length(3, 50)
  name: string;

  @ApiProperty({
    type: String,
    example: 'List users',
  })
  @IsString()
  @Length(3, 255)
  description: string;
}
