import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../../src/config';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();
    service = module.get<PrismaService>(PrismaService);
    service.$connect = jest.fn();
    service.$disconnect = jest.fn();
  });

  it('should service be defined', () => {
    // Assert
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call $connect once', async () => {
      // Arrange
      const connectSpy = jest.spyOn(service, '$connect');

      // Act
      await service.onModuleInit();

      // Assert
      expect(connectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('onModuleDestroy', () => {
    it('should call $disconnect once', async () => {
      // Arrange
      const disconnectSpy = jest.spyOn(service, '$disconnect');

      // Act
      await service.onModuleDestroy();

      // Assert
      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });
  });
});
