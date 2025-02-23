import { Test, TestingModule } from '@nestjs/testing';
import { RoleRepository } from '../../../../src/app/repositories';
import { PrismaService } from '../../../../src/config';
import { Permission, Role } from '@prisma/client';

describe('RoleRepository', () => {
  let repository: RoleRepository;
  let service: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleRepository,
        {
          provide: PrismaService,
          useValue: {
            role: {
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
    repository = module.get<RoleRepository>(RoleRepository);
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
    it('should find all roles', async () => {
      // Arrange
      const where = {};
      const expectedRoles = [] as Role[];
      const findManySpy = jest
        .spyOn(service.role, 'findMany')
        .mockResolvedValueOnce(expectedRoles);

      // Act
      const result = await repository.findAll(where);

      // Assert
      expect(result).toEqual(expectedRoles);
      expect(findManySpy).toHaveBeenCalledWith({ where });
    });
  });

  describe('findOne', () => {
    it('should find a role', async () => {
      // Arrange
      const where = {
        id: 'valid-id',
      };
      const expectedRole = {
        id: 'id',
        name: 'name',
        description: 'description',
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: [],
      } as Role & { permissions: Permission[] };
      const findUniqueSpy = jest
        .spyOn(service.role, 'findUnique')
        .mockResolvedValueOnce(expectedRole);

      // Act
      const result = await repository.findOne(where);

      // Assert
      expect(result).toEqual(expectedRole);
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where,
        include: { permissions: true },
      });
    });
  });

  describe('createOne', () => {
    it('should create a role', async () => {
      // Arrange
      const data = {
        name: 'name',
        description: 'description',
      };
      const expectedRole = {
        ...data,
      } as Role;
      const createSpy = jest
        .spyOn(service.role, 'create')
        .mockResolvedValueOnce(expectedRole);

      // Act
      const result = await repository.createOne(data);

      // Assert
      expect(result).toEqual(expectedRole);
      expect(createSpy).toHaveBeenCalledWith({ data });
    });
  });

  describe('updateOne', () => {
    it('should update a role', async () => {
      // Arrange
      const where = {
        id: 'valid-id',
      };
      const data = {
        name: 'updated-name',
        description: 'updated-description',
      };
      const expectedRole = {
        ...data,
      } as Role;
      const updateSpy = jest
        .spyOn(service.role, 'update')
        .mockResolvedValueOnce(expectedRole);

      // Act
      const result = await repository.updateOne(where, data);

      // Assert
      expect(result).toEqual(expectedRole);
      expect(updateSpy).toHaveBeenCalledWith({ where, data });
    });
  });

  describe('deleteOne', () => {
    it('should delete a role', async () => {
      // Arrange
      const where = {
        id: 'valid-id',
      };
      const expectedRole = {} as Role;
      const deleteSpy = jest
        .spyOn(service.role, 'delete')
        .mockResolvedValueOnce(expectedRole);

      // Act
      const result = await repository.deleteOne(where);

      // Assert
      expect(result).toEqual(expectedRole);
      expect(deleteSpy).toHaveBeenCalledWith({ where });
    });
  });

  describe('disconectPermissions', () => {
    it('should erase permissions from role', async () => {
      // Arrange
      const where = {
        id: 'valid-id',
      };
      const permissions = [{} as Permission];
      const expectedRole = {} as Role;
      const disconectRolesSpy = jest
        .spyOn(service.role, 'update')
        .mockResolvedValueOnce(expectedRole);

      // Act
      const result = await repository.disconectPermissions(where, permissions);

      // Assert
      expect(result).toEqual(expectedRole);
      expect(disconectRolesSpy).toHaveBeenCalledWith({
        where,
        data: {
          permissions: {
            disconnect: permissions.map((permission) => ({
              id: permission.id,
            })),
          },
        },
        include: { permissions: true },
      });
    });
  });

  describe('connectPermissions', () => {
    it('should connect permissions to role', async () => {
      // Arrange
      const where = {
        id: 'valid-id',
      };
      const permissions = ['permission-id'];
      const expectedRole = {} as Role;
      const disconectRolesSpy = jest
        .spyOn(service.role, 'update')
        .mockResolvedValueOnce(expectedRole);

      // Act
      const result = await repository.connectPermissions(where, permissions);

      // Assert
      expect(result).toEqual(expectedRole);
      expect(disconectRolesSpy).toHaveBeenCalledWith({
        where,
        data: {
          permissions: {
            connect: permissions.map((permission) => ({ id: permission })),
          },
        },
        include: { permissions: true },
      });
    });
  });
});
