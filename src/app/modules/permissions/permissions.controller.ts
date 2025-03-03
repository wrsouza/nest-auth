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
import { PermissionsService } from './permissions.service';
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
  PermissionCreateDto,
  PermissionUpdateDto,
  PermissionResponseDto,
} from './dtos';
import { AuthGuard, Roles } from '../../../common';

@ApiTags('Permissions')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @Get()
  @Roles(['permissions:list'])
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, type: PermissionResponseDto, isArray: true })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async findAll(): Promise<PermissionResponseDto[]> {
    return this.service.findAll();
  }

  @Post()
  @Roles(['permissions:create'])
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a permission' })
  @ApiResponse({ status: 201, type: PermissionResponseDto })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async createOne(
    @Body() body: PermissionCreateDto,
  ): Promise<PermissionResponseDto> {
    return this.service.createOne(body);
  }

  @Get(':id')
  @Roles(['permissions:read'])
  @ApiOperation({ summary: 'Get a permission by id' })
  @ApiResponse({ status: 200, type: PermissionResponseDto })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiNotFoundResponse({ description: 'Not Found Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async findOne(@Param('id') id: string): Promise<PermissionResponseDto> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles(['permissions:update'])
  @ApiOperation({ summary: 'Update a permission by id' })
  @ApiResponse({ status: 200, type: PermissionResponseDto })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiNotFoundResponse({ description: 'Not Found Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async updateOne(
    @Param('id') id: string,
    @Body() body: PermissionUpdateDto,
  ): Promise<PermissionResponseDto> {
    return this.service.updateOne(id, body);
  }

  @Delete(':id')
  @Roles(['permissions:delete'])
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a permission by id' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiNotFoundResponse({ description: 'Not Found Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async deleteOne(@Param('id') id: string): Promise<void> {
    return this.service.deleteOne(id);
  }
}
