import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
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
  PermissionResponse,
} from './dtos';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, type: PermissionResponse, isArray: true })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async findAll(): Promise<PermissionResponse[]> {
    return this.service.findAll();
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a permission' })
  @ApiResponse({ status: 201, type: PermissionResponse })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async createOne(
    @Body() body: PermissionCreateDto,
  ): Promise<PermissionResponse> {
    return this.service.createOne(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a permission by id' })
  @ApiResponse({ status: 200, type: PermissionResponse })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiNotFoundResponse({ description: 'Not Found Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async findOne(@Param('id') id: string): Promise<PermissionResponse> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Update a permission by id' })
  @ApiResponse({ status: 200, type: PermissionResponse })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiNotFoundResponse({ description: 'Not Found Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async updateOne(
    @Param('id') id: string,
    @Body() body: PermissionUpdateDto,
  ): Promise<PermissionResponse> {
    return this.service.updateOne(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a permission by id' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiNotFoundResponse({ description: 'Not Found Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async deleteOne(@Param('id') id: string): Promise<void> {
    return this.service.deleteOne(id);
  }
}
