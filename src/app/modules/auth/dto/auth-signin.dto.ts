import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class AuthSignInDto {
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
  password: string;
}
