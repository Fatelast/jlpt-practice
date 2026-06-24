import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

function createConfigService(values: Record<string, string> = {}) {
  return {
    get: jest.fn((key: string) => values[key]),
  } as Pick<ConfigService, 'get'>;
}

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
    const service = new AuthService(
      prisma as never,
      tokenService as never,
      createConfigService() as never,
    );

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

  it('uses WeChat code2Session openid when app credentials are configured', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        openid: 'wechat-openid',
        session_key: 'session-key',
      }),
    } as never);
    const prisma = {
      user: {
        upsert: jest.fn().mockResolvedValue({
          id: 12n,
          nickname: '太郎',
          avatarUrl: null,
          currentLevel: 'N5',
        }),
      },
    };
    const tokenService = {
      signUserToken: jest.fn().mockResolvedValue('user-token'),
    };
    const service = new AuthService(
      prisma as never,
      tokenService as never,
      createConfigService({
        'wechat.appId': 'wx-test',
        'wechat.appSecret': 'secret-test',
      }) as never,
    );

    await service.wechatLogin({ code: 'wx-code', nickname: '太郎' });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://api.weixin.qq.com/sns/jscode2session'),
    );
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('appid=wx-test'));
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('secret=secret-test'),
    );
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('js_code=wx-code'));
    expect(prisma.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { openid: 'wechat-openid' },
      }),
    );

    fetchSpy.mockRestore();
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
    const service = new AuthService(
      prisma as never,
      {} as never,
      createConfigService() as never,
    );

    await expect(
      service.adminLogin({ username: 'admin', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
