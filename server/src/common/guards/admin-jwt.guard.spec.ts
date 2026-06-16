import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminJwtGuard } from './admin-jwt.guard';

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

describe('AdminJwtGuard', () => {
  it('accepts valid admin tokens and attaches current admin', async () => {
    const jwtService = {
      verifyAsync: jest
        .fn()
        .mockResolvedValue({ sub: '3', type: 'admin', role: 'admin' }),
    } as unknown as JwtService;
    const guard = new AdminJwtGuard(jwtService);
    const context = createContext('Bearer token');

    await expect(guard.canActivate(context)).resolves.toBe(true);

    const request = context.switchToHttp().getRequest();
    expect(request.admin).toEqual({ id: '3', type: 'admin', role: 'admin' });
  });

  it('rejects user tokens on admin routes', async () => {
    const jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({ sub: '1', type: 'user' }),
    } as unknown as JwtService;
    const guard = new AdminJwtGuard(jwtService);

    await expect(guard.canActivate(createContext('Bearer token'))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
