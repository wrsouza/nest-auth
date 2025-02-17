import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../../repositories';
import { BcryptService } from '../../../common/bcrypt/bcrypt.service';
import { AuthSignInDto, AuthResponseDto, AuthPayloadUserDto } from './dto';
import { ResponseErrorEnum } from '../../../common/enums/response-error.enum';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly repository: UserRepository,
    private readonly bcrypt: BcryptService,
    private readonly jwt: JwtService,
  ) {}

  async signIn(body: AuthSignInDto): Promise<AuthResponseDto> {
    const user = await this.repository.findOne({
      email: body.email,
      isActive: true,
    });
    if (!user) {
      throw new BadRequestException(ResponseErrorEnum.AUTH_INVALID);
    }

    const isValid = this.bcrypt.compare(body.password, user.password);
    if (!isValid) {
      throw new BadRequestException(ResponseErrorEnum.AUTH_INVALID);
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);

    return new AuthResponseDto(user, accessToken);
  }

  async getProfile(payload: AuthPayloadUserDto) {
    const user = await this.repository.findOne({ id: payload.sub });

    if (!user) {
      throw new NotFoundException(ResponseErrorEnum.USER_NOT_FOUND);
    }

    return new AuthResponseDto(user);
  }
}
