import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyPassword } from '../../common/utils/password';
import { PrismaService } from '../../prisma/prisma.service';
import type { AdminRole } from '../../types/auth';
import { AuthTokenService } from './auth-token.service';
import type { AdminLoginDto } from './dto/admin-login.dto';
import type { WechatLoginDto } from './dto/wechat-login.dto';

interface WechatCodeSessionResponse {
  openid?: string;
  session_key?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authTokenService: AuthTokenService,
    private readonly configService: ConfigService,
  ) {}

  async wechatLogin(data: WechatLoginDto) {
    const openid = await this.resolveOpenid(data.code);
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

  /**
   * Context: 本地开发允许无微信密钥运行；一旦配置 AppID/AppSecret，则必须使用微信
   * code2Session 解析真实 openid，避免真机用户都落到 dev openid 空间。
   */
  private async resolveOpenid(code: string) {
    const appId = this.configService.get<string>('wechat.appId');
    const appSecret = this.configService.get<string>('wechat.appSecret');

    if (!appId || !appSecret) {
      return this.toDevelopmentOpenid(code);
    }

    const params = new URLSearchParams({
      appid: appId,
      secret: appSecret,
      js_code: code,
      grant_type: 'authorization_code',
    });
    const response = await fetch(
      `https://api.weixin.qq.com/sns/jscode2session?${params.toString()}`,
    );
    const session = (await response.json()) as WechatCodeSessionResponse;

    if (!session.openid) {
      throw new UnauthorizedException(session.errmsg ?? '微信登录凭证无效');
    }

    return session.openid;
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
