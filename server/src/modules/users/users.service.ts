import { Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@prisma/client';
import { toBigIntId } from '../../common/utils/id';
import { PrismaService } from '../../prisma/prisma.service';
import type { UpdateCurrentLevelDto } from './dto/update-current-level.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: toBigIntId(userId, 'userId'),
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return this.formatUser(user);
  }

  async updateCurrentLevel(userId: string, data: UpdateCurrentLevelDto) {
    const user = await this.prisma.user.update({
      where: { id: toBigIntId(userId, 'userId') },
      data: { currentLevel: data.level },
    });

    return this.formatUser(user);
  }

  private formatUser(
    user: Pick<User, 'id' | 'nickname' | 'avatarUrl' | 'currentLevel'>,
  ) {
    return {
      id: String(user.id),
      nickname: user.nickname ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      currentLevel: user.currentLevel,
    };
  }
}
