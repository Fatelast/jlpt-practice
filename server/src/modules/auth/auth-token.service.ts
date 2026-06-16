import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AdminRole } from '../../types/auth';

@Injectable()
export class AuthTokenService {
  constructor(private readonly jwtService: JwtService) {}

  signUserToken(userId: string) {
    return this.jwtService.signAsync({
      sub: userId,
      type: 'user',
    });
  }

  signAdminToken(adminId: string, role: AdminRole) {
    return this.jwtService.signAsync({
      sub: adminId,
      type: 'admin',
      role,
    });
  }
}
