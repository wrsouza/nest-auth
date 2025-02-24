import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from '../../../../../src/app/modules/permissions/permissions.controller';
import { PermissionsService } from '../../../../../src/app/modules/permissions/permissions.service';
import { AuthGuard } from '../../../../../src/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../../../src/config';
import { PermissionResponseDto } from '../../../../../src/app/modules/permissions/dtos';

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let service: PermissionsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: {
            findAll: jest.fn(),
            createOne: jest.fn(),
            findOne: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
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

    controller = module.get<PermissionsController>(PermissionsController);
    service = module.get<PermissionsService>(PermissionsService);
  });

  it('should all to be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should find all permissions', async () => {
      // Arrange
      const expectedResult = [] as PermissionResponseDto[];
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
    it('should create a permission', async () => {
      // Arrange
      const data = {
        name: 'new-name',
        description: 'new-description',
      };
      const expectedResult = {} as PermissionResponseDto;
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
    it('should find a permission', async () => {
      // Arrange
      const id = 'update-id';
      const expectedResult = {} as PermissionResponseDto;
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
    it('should update a permission', async () => {
      // Arrange
      const id = 'update-id';
      const data = {
        name: 'update-name',
        description: 'update-description',
      };
      const expectedResult = {} as PermissionResponseDto;
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
    it('should delete a permission', async () => {
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
});
