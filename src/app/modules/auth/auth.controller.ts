import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AuthSignInDto,
  AuthResponseDto,
  AuthRequestDto,
  ProfileResponseDto,
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
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiForbiddenResponse({ description: 'Forbidden Error' })
  getProfile(@Request() req: AuthRequestDto): ProfileResponseDto {
    return req.user;
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Sign In' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async signIn(@Body() body: AuthSignInDto): Promise<AuthResponseDto> {
    return this.authService.signIn(body);
  }

  @Post('refresh')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiForbiddenResponse({ description: 'Forbidden Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async refreshToken(@Request() req: AuthRequestDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(req.user);
  }
}
