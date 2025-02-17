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
import { RolesService } from './roles.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleCreateDto, RoleUpdateDto, RoleResponse } from './dtos';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all Roles' })
  @ApiResponse({ status: 200, type: RoleResponse, isArray: true })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async findAll(): Promise<RoleResponse[]> {
    return this.service.findAll();
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a Role' })
  @ApiResponse({ status: 201, type: RoleResponse })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async createOne(@Body() body: RoleCreateDto): Promise<RoleResponse> {
    return this.service.createOne(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a Role by id' })
  @ApiResponse({ status: 200, type: RoleResponse })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiNotFoundResponse({ description: 'Not Found Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async findOne(@Param('id') id: string): Promise<RoleResponse> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a Role by id' })
  @ApiResponse({ status: 200, type: RoleResponse })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiNotFoundResponse({ description: 'Not Found Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async updateOne(
    @Param('id') id: string,
    @Body() body: RoleUpdateDto,
  ): Promise<RoleResponse> {
    return this.service.updateOne(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a Role by id' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiNotFoundResponse({ description: 'Not Found Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async deleteOne(@Param('id') id: string): Promise<void> {
    return this.service.deleteOne(id);
  }
}
