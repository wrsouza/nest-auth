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
import {
  RoleCreateDto,
  RoleUpdateDto,
  RoleResponseDto,
  RolePermissionsDto,
} from './dtos';
import { Roles } from '../../../common';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get()
  @Roles(['roles:list'])
  @ApiOperation({ summary: 'Get all Roles' })
  @ApiResponse({ status: 200, type: RoleResponseDto, isArray: true })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async findAll(): Promise<RoleResponseDto[]> {
    return this.service.findAll();
  }

  @Post()
  @Roles(['roles:create'])
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a Role' })
  @ApiResponse({ status: 201, type: RoleResponseDto })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async createOne(@Body() body: RoleCreateDto): Promise<RoleResponseDto> {
    return this.service.createOne(body);
  }

  @Get(':id')
  @Roles(['roles:read'])
  @ApiOperation({ summary: 'Get a Role by id' })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiNotFoundResponse({ description: 'Not Found Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async findOne(@Param('id') id: string): Promise<RoleResponseDto> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles(['roles:update'])
  @ApiOperation({ summary: 'Update a Role by id' })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiNotFoundResponse({ description: 'Not Found Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async updateOne(
    @Param('id') id: string,
    @Body() body: RoleUpdateDto,
  ): Promise<RoleResponseDto> {
    return this.service.updateOne(id, body);
  }

  @Delete(':id')
  @Roles(['roles:delete'])
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a Role by id' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiNotFoundResponse({ description: 'Not Found Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async deleteOne(@Param('id') id: string): Promise<void> {
    return this.service.deleteOne(id);
  }

  @Put(':id/permissions')
  @Roles(['roles:permissions'])
  @ApiOperation({ summary: 'Connect many permissions to one role' })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiNotFoundResponse({ description: 'Not Found Error' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  updateRoles(
    @Param('id') id: string,
    @Body() body: RolePermissionsDto,
  ): Promise<RoleResponseDto> {
    return this.service.updatePermissions(id, body.permissions);
  }
}
