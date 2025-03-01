import { NestApplication } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

describe('Main', () => {
  let app: NestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'JWT_SECRET';
    process.env.JWT_EXPIRES = '3600s';
    process.env.DATABASE_URL = 'postgresql://';
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication<NestApplication>();
  });

  it('should app to be defined', () => {
    expect(app).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
