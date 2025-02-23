import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../../../src/app/repositories';
import { PrismaService } from '../../../../src/config';
import { Role, User } from '@prisma/client';

describe('UserRepository', () => {
  let repository: UserRepository;
  let service: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: {
            user: {
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
    repository = module.get<UserRepository>(UserRepository);
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
    it('should find all users', async () => {
      // Arrange
      const where = {};
      const expectedUsers = [] as User[];
      const findManySpy = jest
        .spyOn(service.user, 'findMany')
        .mockResolvedValueOnce(expectedUsers);

      // Act
      const result = await repository.findAll(where);

      // Assert
      expect(result).toEqual(expectedUsers);
      expect(findManySpy).toHaveBeenCalledWith({ where });
    });
  });

  describe('findOne', () => {
    it('should find a user', async () => {
      // Arrange
      const where = {
        id: 'valid-id',
      };
      const expectedUser = {
        id: 'id',
        name: 'name',
        email: 'email',
        password: 'hash-password',
        isAdmin: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [],
      } as User & { roles: Role[] };
      const findUniqueSpy = jest
        .spyOn(service.user, 'findUnique')
        .mockResolvedValueOnce(expectedUser);

      // Act
      const result = await repository.findOne(where);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where,
        include: { roles: true },
      });
    });
  });

  describe('createOne', () => {
    it('should create a user', async () => {
      // Arrange
      const data = {
        name: 'name',
        email: 'email',
        password: 'hash-password',
        isAdmin: false,
        isActive: true,
      };
      const expectedUser = {
        ...data,
      } as User;
      const createSpy = jest
        .spyOn(service.user, 'create')
        .mockResolvedValueOnce(expectedUser);

      // Act
      const result = await repository.createOne(data);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(createSpy).toHaveBeenCalledWith({ data });
    });
  });

  describe('updateOne', () => {
    it('should update a user', async () => {
      // Arrange
      const where = {
        id: 'valid-id',
      };
      const data = {
        name: 'name',
        email: 'email',
        password: 'hash-password',
        isAdmin: false,
        isActive: true,
      };
      const expectedUser = {
        ...data,
      } as User;
      const updateSpy = jest
        .spyOn(service.user, 'update')
        .mockResolvedValueOnce(expectedUser);

      // Act
      const result = await repository.updateOne(where, data);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(updateSpy).toHaveBeenCalledWith({ where, data });
    });
  });

  describe('deleteOne', () => {
    it('should delete a user', async () => {
      // Arrange
      const where = {
        id: 'valid-id',
      };
      const expectedUser = {} as User;
      const deleteSpy = jest
        .spyOn(service.user, 'delete')
        .mockResolvedValueOnce(expectedUser);

      // Act
      const result = await repository.deleteOne(where);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(deleteSpy).toHaveBeenCalledWith({ where });
    });
  });

  describe('disconectRoles', () => {
    it('should erase roles from user', async () => {
      // Arrange
      const where = {
        id: 'valid-id',
      };
      const roles = [{} as Role];
      const expectedUser = {} as User;
      const disconectRolesSpy = jest
        .spyOn(service.user, 'update')
        .mockResolvedValueOnce(expectedUser);

      // Act
      const result = await repository.disconectRoles(where, roles);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(disconectRolesSpy).toHaveBeenCalledWith({
        where,
        data: {
          roles: {
            disconnect: roles.map((role) => ({ id: role.id })),
          },
        },
        include: { roles: true },
      });
    });
  });

  describe('connectRoles', () => {
    it('should connect roles to user', async () => {
      // Arrange
      const where = {
        id: 'valid-id',
      };
      const roles = ['role-id'];
      const expectedUser = {} as User;
      const disconectRolesSpy = jest
        .spyOn(service.user, 'update')
        .mockResolvedValueOnce(expectedUser);

      // Act
      const result = await repository.connectRoles(where, roles);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(disconectRolesSpy).toHaveBeenCalledWith({
        where,
        data: {
          roles: {
            connect: roles.map((role) => ({ id: role })),
          },
        },
        include: { roles: true },
      });
    });
  });
});
