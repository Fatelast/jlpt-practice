import { BadRequestException, Injectable } from '@nestjs/common';
import { toBigIntId } from '../../common/utils/id';
import { PrismaService } from '../../prisma/prisma.service';
import type { GetPracticeQuestionsDto } from './dto/get-practice-questions.dto';
import {
  formatQuestion,
  type QuestionWithClientRelations,
} from './question-presenter';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPracticeQuestions(userId: string, query: GetPracticeQuestionsDto) {
    if (query.category === 'listening') {
      throw new BadRequestException('MVP 阶段暂不开放听力题');
    }

    const userBigIntId = toBigIntId(userId, 'userId');
    const where = {
      level: query.level,
      ...(query.category === 'mixed' ? {} : { category: query.category }),
      status: 'published',
      deletedAt: null,
      ...(query.mode === 'wrong'
        ? { wrongQuestions: { some: { userId: userBigIntId, mastered: false } } }
        : {}),
      ...(query.mode === 'favorite'
        ? { favoriteQuestions: { some: { userId: userBigIntId } } }
        : {}),
    };

    const questions = await this.prisma.question.findMany({
      where,
      include: {
        options: { orderBy: { sortOrder: 'asc' } },
        questionTags: { include: { tag: true } },
        favoriteQuestions: { where: { userId: userBigIntId } },
      },
      orderBy: query.mode === 'random' ? { updatedAt: 'desc' } : { id: 'asc' },
      take: query.count,
    });

    return questions.map((question) =>
      formatQuestion(question as QuestionWithClientRelations),
    );
  }
}
