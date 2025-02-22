import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AuthSignInDto,
  AuthResponseDto,
  AuthPayloadDto,
  AuthPayloadUserDto,
} from './dto';
import { AuthGuard } from '../../../common';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, type: AuthPayloadUserDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getProfile(@Request() req: AuthPayloadDto) {
    return req.user;
  }

  @Post()
  @ApiOperation({ summary: 'Sign In' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async signIn(@Body() body: AuthSignInDto): Promise<AuthResponseDto> {
    return this.authService.signIn(body);
  }
}
