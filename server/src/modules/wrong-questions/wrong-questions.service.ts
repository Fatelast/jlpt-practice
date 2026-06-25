import { Injectable, NotFoundException } from '@nestjs/common';
import { toBigIntId } from '../../common/utils/id';
import { PrismaService } from '../../prisma/prisma.service';
import {
  formatQuestion,
  type QuestionWithClientRelations,
} from '../questions/question-presenter';

type WrongQuestionWithQuestion = {
  wrongCount: number;
  lastWrongAnswer: string | null;
  lastWrongAt: Date;
  mastered: boolean;
  question: QuestionWithClientRelations;
};

@Injectable()
export class WrongQuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWrongQuestions(userId: string) {
    const userBigIntId = toBigIntId(userId, 'userId');
    const wrongQuestions = await this.prisma.wrongQuestion.findMany({
      where: {
        userId: userBigIntId,
        mastered: false,
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
      orderBy: { lastWrongAt: 'desc' },
    });

    return (wrongQuestions as WrongQuestionWithQuestion[]).map((item) => ({
      question: formatQuestion(item.question),
      wrongCount: item.wrongCount,
      lastWrongAnswer: item.lastWrongAnswer,
      lastWrongAt: item.lastWrongAt.toISOString(),
      mastered: item.mastered,
    }));
  }

  async markAsMastered(userId: string, questionId: string) {
    try {
      await this.prisma.wrongQuestion.update({
        where: {
          userId_questionId: {
            userId: toBigIntId(userId, 'userId'),
            questionId: toBigIntId(questionId, 'questionId'),
          },
        },
        data: {
          mastered: true,
          masteredAt: new Date(),
        },
      });
    } catch (error) {
      if (typeof error === 'object' && error && 'code' in error && error.code === 'P2025') {
        throw new NotFoundException('错题不存在');
      }

      throw error;
    }

    return {
      questionId,
      mastered: true,
    };
  }
}
