import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AuthJwtPayload, CurrentAdmin } from '../../types/auth';
import { parseBearerToken } from './auth-header';

@Injectable()
export class AdminJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = Array.isArray(request.headers.authorization)
      ? request.headers.authorization[0]
      : request.headers.authorization;
    const token = parseBearerToken(authorization);
    const payload = await this.jwtService.verifyAsync<AuthJwtPayload>(token);

    if (payload.type !== 'admin') {
      throw new UnauthorizedException('token 无效');
    }

    request.admin = {
      id: payload.sub,
      type: 'admin',
      role: payload.role,
    } satisfies CurrentAdmin;

    return true;
  }
}
