import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../config/database/database.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from '../../repositories/user.repository';
import { BcryptModule } from '../../../common/bcrypt/bcrypt.module';

@Module({
  imports: [DatabaseModule, BcryptModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
})
export class UsersModule {}
