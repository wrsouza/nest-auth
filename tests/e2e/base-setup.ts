/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import * as defaults from 'superagent-defaults';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/config';
import { PGlite } from '@electric-sql/pglite';
import { PrismaPGlite } from 'pglite-prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { Migrations } from './migrations';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from '../../src/common';
import { DriverAdapter } from '@prisma/client/runtime/library';
import { App } from 'supertest/types';

export class BaseSetup {
  private module: TestingModule;
  private app: INestApplication;
  private prisma: PrismaService;
  private request: supertest.SuperAgentTest;
  private jwt: JwtService;
  private bcrypt: BcryptService;

  async beforeAll() {
    process.env.JWT_SECRET = 'JWT_SECRET';
    process.env.JWT_EXPIRES = '3600s';

    this.module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useFactory({
        factory: () => {
          const client = new PGlite();
          const adapter = new PrismaPGlite(client) as DriverAdapter;
          return new PrismaClient({ adapter });
        },
      })
      .compile();
    await this.initApp();
    this.setProviders();
    await this.runMigrations();
  }

  private async initApp() {
    this.app = this.module.createNestApplication();
    this.app.setGlobalPrefix('api');
    this.app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await this.app.init();
  }

  private setProviders() {
    this.request = defaults(supertest(this.app.getHttpServer() as App));
    this.jwt = this.module.get<JwtService>(JwtService);
    this.bcrypt = this.module.get<BcryptService>(BcryptService);
    this.prisma = this.module.get<PrismaService>(PrismaService);
  }

  private async runMigrations() {
    const migrations = new Migrations(this.prisma);
    await migrations.exec();
  }

  beforeEach() {
    jest.setTimeout(60000);
  }

  async afterEach() {
    jest.clearAllMocks();
    await this.prisma.permission.deleteMany({});
    await this.prisma.role.deleteMany({});
    await this.prisma.user.deleteMany({});
  }

  async afterAll() {
    await this.prisma.$disconnect();
    if (this.app) {
      await this.app.close();
    }
  }

  get Request() {
    return this.request;
  }

  get Prisma() {
    return this.prisma;
  }

  get Jwt() {
    return this.jwt;
  }

  get Bcrypt() {
    return this.bcrypt;
  }
}
