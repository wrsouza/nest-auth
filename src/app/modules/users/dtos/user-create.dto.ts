import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString, Length } from 'class-validator';

export class UserCreateDto {
  @ApiProperty({
    type: String,
    example: 'John Doe',
  })
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiProperty({
    type: String,
    example: 'john.doe@domain.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    example: 'example',
  })
  @IsString()
  @Length(6, 20)
  password: string;

  @ApiProperty({
    type: Boolean,
    example: 'false',
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    type: Boolean,
    example: 'false',
  })
  @IsBoolean()
  isAdmin: boolean;
}
