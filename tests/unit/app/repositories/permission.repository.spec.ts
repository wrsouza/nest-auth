import { Test, TestingModule } from '@nestjs/testing';
import { PermissionRepository } from '../../../../src/app/repositories';
import { PrismaService } from '../../../../src/config';
import { Permission } from '@prisma/client';

describe('PermissionRepository', () => {
  let repository: PermissionRepository;
  let service: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionRepository,
        {
          provide: PrismaService,
          useValue: {
            permission: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();
    repository = module.get<PermissionRepository>(PermissionRepository);
    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be all defined', () => {
    expect(repository).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should find all permissions', async () => {
      // Arrange
      const where = {};
      const expectedPermissions = [] as Permission[];
      const findManySpy = jest
        .spyOn(service.permission, 'findMany')
        .mockResolvedValueOnce(expectedPermissions);

      // Act
      const result = await repository.findAll(where);

      // Assert
      expect(result).toEqual(expectedPermissions);
      expect(findManySpy).toHaveBeenCalledWith({ where });
    });
  });

  describe('findOne', () => {
    it('should find a permission', async () => {
      // Arrange
      const where = {
        id: 'valid-id',
      };
      const expectedPermission = {} as Permission;
      const findUniqueSpy = jest
        .spyOn(service.permission, 'findUnique')
        .mockResolvedValueOnce(expectedPermission);

      // Act
      const result = await repository.findOne(where);

      // Assert
      expect(result).toEqual(expectedPermission);
      expect(findUniqueSpy).toHaveBeenCalledWith({ where });
    });
  });

  describe('createOne', () => {
    it('should create a permission', async () => {
      // Arrange
      const data = {
        name: 'name',
        description: 'description',
      };
      const expectedPermission = {
        ...data,
      } as Permission;
      const createSpy = jest
        .spyOn(service.permission, 'create')
        .mockResolvedValueOnce(expectedPermission);

      // Act
      const result = await repository.createOne(data);

      // Assert
      expect(result).toEqual(expectedPermission);
      expect(createSpy).toHaveBeenCalledWith({ data });
    });
  });

  describe('updateOne', () => {
    it('should update a permission', async () => {
      // Arrange
      const where = {
        id: 'valid-id',
      };
      const data = {
        name: 'updated-name',
        description: 'updated-description',
      };
      const expectedPermission = {
        ...data,
      } as Permission;
      const updateSpy = jest
        .spyOn(service.permission, 'update')
        .mockResolvedValueOnce(expectedPermission);

      // Act
      const result = await repository.updateOne(where, data);

      // Assert
      expect(result).toEqual(expectedPermission);
      expect(updateSpy).toHaveBeenCalledWith({ where, data });
    });
  });

  describe('deleteOne', () => {
    it('should delete a permission', async () => {
      // Arrange
      const where = {
        id: 'valid-id',
      };
      const expectedPermission = {} as Permission;
      const deleteSpy = jest
        .spyOn(service.permission, 'delete')
        .mockResolvedValueOnce(expectedPermission);

      // Act
      const result = await repository.deleteOne(where);

      // Assert
      expect(result).toEqual(expectedPermission);
      expect(deleteSpy).toHaveBeenCalledWith({ where });
    });
  });
});
