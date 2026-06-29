import { Injectable, NotFoundException } from '@nestjs/common';
import { toBigIntId } from '../../common/utils/id';
import { PrismaService } from '../../prisma/prisma.service';
import {
  formatQuestion,
  type QuestionWithClientRelations,
} from '../questions/question-presenter';

type FavoriteQuestionWithQuestion = {
  question: QuestionWithClientRelations;
};

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async getFavorites(userId: string) {
    const userBigIntId = toBigIntId(userId, 'userId');
    const favorites = await this.prisma.favoriteQuestion.findMany({
      where: {
        userId: userBigIntId,
        question: {
          status: 'published',
          deletedAt: null,
        },
      },
      include: {
        question: {
          include: {
            options: { orderBy: { sortOrder: 'asc' } },
            questionTags: { include: { tag: true } },
            favoriteQuestions: { where: { userId: userBigIntId } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return (favorites as FavoriteQuestionWithQuestion[]).map((item) =>
      formatQuestion(item.question),
    );
  }

  async favoriteQuestion(userId: string, questionId: string) {
    const userBigIntId = toBigIntId(userId, 'userId');
    const questionBigIntId = toBigIntId(questionId, 'questionId');
    const question = await this.prisma.question.findFirst({
      where: {
        id: questionBigIntId,
        status: 'published',
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!question) {
      throw new NotFoundException('题目不存在');
    }

    await this.prisma.favoriteQuestion.upsert({
      where: {
        userId_questionId: {
          userId: userBigIntId,
          questionId: questionBigIntId,
        },
      },
      update: {},
      create: {
        userId: userBigIntId,
        questionId: questionBigIntId,
      },
    });

    return {
      questionId,
      isFavorite: true,
    };
  }

  async unfavoriteQuestion(userId: string, questionId: string) {
    try {
      await this.prisma.favoriteQuestion.delete({
        where: {
          userId_questionId: {
            userId: toBigIntId(userId, 'userId'),
            questionId: toBigIntId(questionId, 'questionId'),
          },
        },
      });
    } catch (error) {
      if (!this.isPrismaNotFound(error)) {
        throw error;
      }
    }

    return {
      questionId,
      isFavorite: false,
    };
  }

  private isPrismaNotFound(error: unknown) {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025';
  }
}
