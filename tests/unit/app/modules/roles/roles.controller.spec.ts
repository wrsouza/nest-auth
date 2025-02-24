import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from '../../../../../src/app/modules/roles/roles.controller';
import { RolesService } from '../../../../../src/app/modules/roles/roles.service';
import { AuthGuard } from '../../../../../src/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../../../src/config';
import { RoleResponseDto } from '../../../../../src/app/modules/roles/dtos';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: {
            findAll: jest.fn(),
            createOne: jest.fn(),
            findOne: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
            updatePermissions: jest.fn(),
          },
        },
        {
          provide: AuthGuard,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  it('should all to be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should find all roles', async () => {
      // Arrange
      const expectedResult = [] as RoleResponseDto[];
      const findAllSpy = jest
        .spyOn(service, 'findAll')
        .mockResolvedValueOnce(expectedResult);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(findAllSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('createOne', () => {
    it('should create a role', async () => {
      // Arrange
      const data = {
        name: 'new-name',
        description: 'new-description',
      };
      const expectedResult = {} as RoleResponseDto;
      const createOneSpy = jest
        .spyOn(service, 'createOne')
        .mockResolvedValueOnce(expectedResult);

      // Act
      const result = await controller.createOne(data);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(createOneSpy).toHaveBeenCalledWith(data);
    });
  });

  describe('findOne', () => {
    it('should find a role', async () => {
      // Arrange
      const id = 'update-id';
      const expectedResult = {} as RoleResponseDto;
      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValueOnce(expectedResult);

      // Act
      const result = await controller.findOne(id);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(findOneSpy).toHaveBeenCalledWith(id);
    });
  });

  describe('updateOne', () => {
    it('should update a role', async () => {
      // Arrange
      const id = 'update-id';
      const data = {
        name: 'update-name',
        description: 'update-description',
      };
      const expectedResult = {} as RoleResponseDto;
      const updateOneSpy = jest
        .spyOn(service, 'updateOne')
        .mockResolvedValueOnce(expectedResult);

      // Act
      const result = await controller.updateOne(id, data);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(updateOneSpy).toHaveBeenCalledWith(id, data);
    });
  });

  describe('deleteOne', () => {
    it('should delete a role', async () => {
      // Arrange
      const id = 'remove-id';
      const deleteOneSpy = jest.spyOn(service, 'deleteOne');

      // Act
      const result = await controller.deleteOne(id);

      // Assert
      expect(result).toBeUndefined();
      expect(deleteOneSpy).toHaveBeenCalledWith(id);
    });
  });

  describe('updatePermissions', () => {
    it('should update permissions from role', async () => {
      // Arrange
      const id = 'updated-id';
      const body = {
        permissions: ['updated-permission'],
      };
      const expectedResult = {} as RoleResponseDto;
      const updatePermissionsSpy = jest
        .spyOn(service, 'updatePermissions')
        .mockResolvedValueOnce(expectedResult);

      // Act
      const result = await controller.updatePermissions(id, body);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(updatePermissionsSpy).toHaveBeenCalledWith(id, body.permissions);
    });
  });
});
