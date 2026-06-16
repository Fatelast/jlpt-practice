import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AuthJwtPayload, CurrentUser } from '../../types/auth';
import { parseBearerToken } from './auth-header';

@Injectable()
export class UserJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = Array.isArray(request.headers.authorization)
      ? request.headers.authorization[0]
      : request.headers.authorization;
    const token = parseBearerToken(authorization);
    const payload = await this.jwtService.verifyAsync<AuthJwtPayload>(token);

    if (payload.type !== 'user') {
      throw new UnauthorizedException('token 无效');
    }

    request.user = {
      id: payload.sub,
      type: 'user',
    } satisfies CurrentUser;

    return true;
  }
}
