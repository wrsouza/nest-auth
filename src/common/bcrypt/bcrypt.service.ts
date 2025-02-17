import { Injectable } from '@nestjs/common';
import { hashSync, compareSync } from 'bcrypt';

@Injectable()
export class BcryptService {
  hash(password: string): string {
    return hashSync(password, 10);
  }

  compare(password: string, hash: string): boolean {
    return compareSync(password, hash);
  }
}
