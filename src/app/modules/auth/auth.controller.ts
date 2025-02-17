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
} from '@nestjs/swagger';
import { AuthSignInDto, AuthResponseDto, AuthPayloadDto } from './dto';
import { AuthGuard } from '../../../common';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getProfile(@Request() req: AuthPayloadDto) {
    return this.authService.getProfile(req.user);
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
