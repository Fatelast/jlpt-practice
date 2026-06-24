import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('logs in a miniapp user with a deterministic development openid', async () => {
    const prisma = {
      user: {
        upsert: jest.fn().mockResolvedValue({
          id: 12n,
          nickname: '太郎',
          avatarUrl: 'https://example.com/avatar.png',
          currentLevel: 'N5',
        }),
      },
    };
    const tokenService = {
      signUserToken: jest.fn().mockResolvedValue('user-token'),
    };
    const service = new AuthService(prisma as never, tokenService as never);

    await expect(
      service.wechatLogin({
        code: 'wx-code',
        nickname: '太郎',
        avatarUrl: 'https://example.com/avatar.png',
      }),
    ).resolves.toEqual({
      token: 'user-token',
      user: {
        id: '12',
        nickname: '太郎',
        avatarUrl: 'https://example.com/avatar.png',
        currentLevel: 'N5',
      },
    });

    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { openid: 'dev:wx-code' },
      update: {
        nickname: '太郎',
        avatarUrl: 'https://example.com/avatar.png',
        lastLoginAt: expect.any(Date),
      },
      create: {
        openid: 'dev:wx-code',
        nickname: '太郎',
        avatarUrl: 'https://example.com/avatar.png',
        lastLoginAt: expect.any(Date),
      },
    });
    expect(tokenService.signUserToken).toHaveBeenCalledWith('12');
  });

  it('rejects admin login when password does not match', async () => {
    const prisma = {
      admin: {
        findUnique: jest.fn().mockResolvedValue({
          id: 1n,
          username: 'admin',
          passwordHash: 'invalid',
          role: 'admin',
          status: 'active',
        }),
      },
    };
    const service = new AuthService(prisma as never, {} as never);

    await expect(
      service.adminLogin({ username: 'admin', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
