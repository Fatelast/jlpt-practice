import { Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyPassword } from '../../common/utils/password';
import { PrismaService } from '../../prisma/prisma.service';
import type { AdminRole } from '../../types/auth';
import { AuthTokenService } from './auth-token.service';
import type { AdminLoginDto } from './dto/admin-login.dto';
import type { WechatLoginDto } from './dto/wechat-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  /**
   * Logs in a miniapp user with a local deterministic openid.
   *
   * Context: real WeChat code exchange needs external credentials and network
   * access. The MVP backend keeps the API contract stable now and can swap this
   * openid resolver later without changing clients.
   */
  async wechatLogin(data: WechatLoginDto) {
    const openid = this.toDevelopmentOpenid(data.code);
    const loginAt = new Date();
    const user = await this.prisma.user.upsert({
      where: { openid },
      update: {
        nickname: data.nickname,
        avatarUrl: data.avatarUrl,
        lastLoginAt: loginAt,
      },
      create: {
        openid,
        nickname: data.nickname,
        avatarUrl: data.avatarUrl,
        lastLoginAt: loginAt,
      },
    });
    const token = await this.authTokenService.signUserToken(String(user.id));

    return {
      token,
      user: {
        id: String(user.id),
        nickname: user.nickname ?? undefined,
        avatarUrl: user.avatarUrl ?? undefined,
        currentLevel: user.currentLevel,
      },
    };
  }

  async adminLogin(data: AdminLoginDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { username: data.username },
    });

    if (
      !admin ||
      admin.status !== 'active' ||
      !verifyPassword(data.password, admin.passwordHash)
    ) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const role = this.toAdminRole(admin.role);
    const token = await this.authTokenService.signAdminToken(String(admin.id), role);

    return {
      token,
      admin: {
        id: String(admin.id),
        username: admin.username,
        role,
      },
    };
  }

  private toDevelopmentOpenid(code: string) {
    return `dev:${code}`;
  }

  private toAdminRole(role: string): AdminRole {
    if (role === 'admin' || role === 'editor' || role === 'reviewer') {
      return role;
    }

    throw new UnauthorizedException('管理员角色无效');
  }
}
