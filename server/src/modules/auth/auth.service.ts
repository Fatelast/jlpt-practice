import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyPassword } from '../../common/utils/password';
import { PrismaService } from '../../prisma/prisma.service';
import type { AdminRole } from '../../types/auth';
import { AuthTokenService } from './auth-token.service';
import type { AdminLoginDto } from './dto/admin-login.dto';
import type { WechatLoginDto } from './dto/wechat-login.dto';

const WECHAT_CODE_SESSION_TIMEOUT_MS = 5000;

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
   * Context: 真机微信登录使用 code2Session；游客体验码不是微信 code，必须保留本地
   * openid 空间，否则配置 AppSecret 后“先体验”会被微信接口判定为 invalid code。
   */
  private async resolveOpenid(code: string) {
    const appId = this.configService.get<string>('wechat.appId');
    const appSecret = this.configService.get<string>('wechat.appSecret');

    if (!appId || !appSecret || this.isGuestCode(code)) {
      return this.toDevelopmentOpenid(code);
    }

    const session = await this.fetchWechatCodeSession(appId, appSecret, code);

    if (!session.openid) {
      throw new UnauthorizedException(session.errmsg ?? '微信登录凭证无效');
    }

    return session.openid;
  }

  private async fetchWechatCodeSession(
    appId: string,
    appSecret: string,
    code: string,
  ) {
    const params = new URLSearchParams({
      appid: appId,
      secret: appSecret,
      js_code: code,
      grant_type: 'authorization_code',
    });
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      WECHAT_CODE_SESSION_TIMEOUT_MS,
    );

    try {
      const response = await fetch(
        `https://api.weixin.qq.com/sns/jscode2session?${params.toString()}`,
        { signal: controller.signal },
      );

      return (await response.json()) as WechatCodeSessionResponse;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new UnauthorizedException('微信登录服务超时，请稍后重试');
      }

      throw new UnauthorizedException('微信登录服务暂不可用，请稍后重试');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private isGuestCode(code: string) {
    return code.startsWith('guest-');
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
