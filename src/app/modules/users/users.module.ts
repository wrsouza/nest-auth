import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository, RoleRepository } from '../../repositories';
import { BcryptModule } from '../../../common';

@Module({
  imports: [BcryptModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, RoleRepository],
})
export class UsersModule {}
