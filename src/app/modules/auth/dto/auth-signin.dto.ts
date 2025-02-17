import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthSignInDto {
  @ApiProperty({
    type: String,
    example: 'john.doe@domain.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    type: String,
    example: 'example',
  })
  @IsString()
  password: string;
}
