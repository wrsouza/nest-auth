import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  UserCreateDto,
  UserUpdateDto,
  UserResponseDto,
  UserRolesDto,
} from './dtos';
import { AuthGuard, Roles } from '../../../common';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @Roles(['users:list'])
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: UserResponseDto, isArray: true })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  findAll(): Promise<UserResponseDto[]> {
    return this.service.findAll();
  }

  @Post()
  @Roles(['users:create'])
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  createOne(@Body() body: UserCreateDto): Promise<UserResponseDto> {
    return this.service.createOne(body);
  }

  @Get(':id')
  @Roles(['users:read'])
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiNotFoundResponse({ description: 'Not Found Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles(['users:update'])
  @ApiOperation({ summary: 'Update a user by id' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiNotFoundResponse({ description: 'Not Found Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  updateOne(
    @Param('id') id: string,
    @Body() body: UserUpdateDto,
  ): Promise<UserResponseDto> {
    return this.service.updateOne(id, body);
  }

  @Delete(':id')
  @Roles(['users:delete'])
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a user by id' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiNotFoundResponse({ description: 'Not Found Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  deleteOne(@Param('id') id: string): Promise<void> {
    return this.service.deleteOne(id);
  }

  @Put(':id/roles')
  @Roles(['users:roles'])
  @ApiOperation({ summary: 'Connect many roles to one user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiNotFoundResponse({ description: 'Not Found Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  updateRoles(
    @Param('id') id: string,
    @Body() body: UserRolesDto,
  ): Promise<UserResponseDto> {
    return this.service.updateRoles(id, body.roles);
  }
}
