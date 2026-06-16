import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserJwtGuard } from './user-jwt.guard';

function createContext(authorization?: string): ExecutionContext {
  const request = {
    headers: {
      authorization,
    },
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('UserJwtGuard', () => {
  it('accepts valid user tokens and attaches current user', async () => {
    const jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({ sub: '1', type: 'user' }),
    } as unknown as JwtService;
    const guard = new UserJwtGuard(jwtService);
    const context = createContext('Bearer token');

    await expect(guard.canActivate(context)).resolves.toBe(true);

    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual({ id: '1', type: 'user' });
  });

  it('rejects admin tokens on user routes', async () => {
    const jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({ sub: '1', type: 'admin' }),
    } as unknown as JwtService;
    const guard = new UserJwtGuard(jwtService);

    await expect(guard.canActivate(createContext('Bearer token'))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
