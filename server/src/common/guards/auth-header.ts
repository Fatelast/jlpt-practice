import { UnauthorizedException } from '@nestjs/common';

export function parseBearerToken(authorization?: string) {
  if (!authorization) {
    throw new UnauthorizedException('未登录');
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new UnauthorizedException('token 无效');
  }

  return token;
}
