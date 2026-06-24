import { BadRequestException, Injectable } from '@nestjs/common';
import type { Question } from '@jlpt-practice/shared';
import { toBigIntId } from '../../common/utils/id';
import { PrismaService } from '../../prisma/prisma.service';
import type { GetPracticeQuestionsDto } from './dto/get-practice-questions.dto';

type QuestionWithRelations = {
  id: bigint;
  level: string;
  category: string;
  type: string;
  stem: string;
  passage: string | null;
  translation: string | null;
  explanation: string;
  answer: string;
  difficulty: number;
  audioUrl: string | null;
  audioText: string | null;
  sourceType: string;
  status: string;
  options: Array<{
    optionKey: string;
    optionText: string;
  }>;
  questionTags: Array<{
    tag: {
      name: string;
    };
  }>;
  favoriteQuestions: Array<{
    questionId: bigint;
  }>;
};

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
      this.formatQuestion(question as QuestionWithRelations),
    );
  }

  private formatQuestion(question: QuestionWithRelations): Question {
    const result: Question = {
      id: String(question.id),
      level: question.level as Question['level'],
      category: question.category as Question['category'],
      type: question.type as Question['type'],
      stem: question.stem,
      options: question.options.map((option) => ({
        key: option.optionKey as Question['options'][number]['key'],
        text: option.optionText,
      })),
      answer: question.answer as Question['answer'],
      explanation: question.explanation,
      difficulty: question.difficulty as Question['difficulty'],
      tags: question.questionTags.map((item) => item.tag.name),
      sourceType: question.sourceType as Question['sourceType'],
      status: question.status as Question['status'],
      isFavorite: question.favoriteQuestions.length > 0,
    };

    if (question.passage) {
      result.passage = question.passage;
    }

    if (question.translation) {
      result.translation = question.translation;
    }

    if (question.audioUrl) {
      result.audioUrl = question.audioUrl;
    }

    if (question.audioText) {
      result.audioText = question.audioText;
    }

    return result;
  }
}
