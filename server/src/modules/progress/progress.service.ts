import { Injectable } from '@nestjs/common';
import type { QuestionCategory } from '@jlpt-practice/shared';
import { toBigIntId } from '../../common/utils/id';
import { PrismaService } from '../../prisma/prisma.service';

const TRACKED_CATEGORIES: QuestionCategory[] = ['moji_goi', 'grammar', 'reading'];
const RECENT_DAY_COUNT = 7;

type AnswerWithCategory = {
  isCorrect: boolean;
  answeredAt: Date;
  question: {
    category: string;
  };
};

type ProgressBucket = {
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
};

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string, referenceDate = new Date()) {
    const userBigIntId = toBigIntId(userId, 'userId');
    const [answers, wrongQuestionCount] = await Promise.all([
      this.prisma.answerRecord.findMany({
        where: { userId: userBigIntId },
        include: {
          question: {
            select: {
              category: true,
            },
          },
        },
        orderBy: { answeredAt: 'asc' },
      }),
      this.prisma.wrongQuestion.count({
        where: {
          userId: userBigIntId,
          mastered: false,
          question: {
            status: 'published',
            deletedAt: null,
          },
        },
      }),
    ]);
    const typedAnswers = answers as AnswerWithCategory[];
    const totalAnswered = typedAnswers.length;
    const correctCount = typedAnswers.filter((answer) => answer.isCorrect).length;
    const todayKey = this.toDateKey(referenceDate);

    return {
      overview: {
        totalAnswered,
        correctCount,
        accuracy: this.toAccuracy(correctCount, totalAnswered),
        wrongQuestionCount,
        todayAnswered: typedAnswers.filter(
          (answer) => this.toDateKey(answer.answeredAt) === todayKey,
        ).length,
        streakDays: this.getStreakDays(typedAnswers, referenceDate),
      },
      recentDays: this.getRecentDays(typedAnswers, referenceDate),
      categoryMastery: this.getCategoryMastery(typedAnswers),
    };
  }

  private getRecentDays(answers: AnswerWithCategory[], referenceDate: Date) {
    return this.getRecentDateKeys(referenceDate).map((date) => {
      const dayAnswers = answers.filter(
        (answer) => this.toDateKey(answer.answeredAt) === date,
      );
      const correctCount = dayAnswers.filter((answer) => answer.isCorrect).length;
      const answeredCount = dayAnswers.length;

      return {
        date,
        answeredCount,
        correctCount,
        wrongCount: answeredCount - correctCount,
        accuracy: this.toAccuracy(correctCount, answeredCount),
      };
    });
  }

  private getCategoryMastery(answers: AnswerWithCategory[]) {
    return TRACKED_CATEGORIES.map((category) => {
      const categoryAnswers = answers.filter(
        (answer) => answer.question.category === category,
      );
      const correctCount = categoryAnswers.filter((answer) => answer.isCorrect).length;
      const answeredCount = categoryAnswers.length;

      return {
        category,
        answeredCount,
        correctCount,
        wrongCount: answeredCount - correctCount,
        accuracy: this.toAccuracy(correctCount, answeredCount),
      };
    });
  }

  private getStreakDays(answers: AnswerWithCategory[], referenceDate: Date) {
    const answeredDateKeys = new Set(
      answers.map((answer) => this.toDateKey(answer.answeredAt)),
    );
    let streakDays = 0;
    let cursor = this.toStartOfDay(referenceDate);

    while (answeredDateKeys.has(this.toDateKey(cursor))) {
      streakDays += 1;
      cursor = this.addDays(cursor, -1);
    }

    return streakDays;
  }

  private getRecentDateKeys(referenceDate: Date) {
    const start = this.addDays(
      this.toStartOfDay(referenceDate),
      -(RECENT_DAY_COUNT - 1),
    );

    return Array.from({ length: RECENT_DAY_COUNT }, (_, index) =>
      this.toDateKey(this.addDays(start, index)),
    );
  }

  private toAccuracy(correctCount: number, answeredCount: number) {
    if (answeredCount === 0) {
      return 0;
    }

    return Number(((correctCount / answeredCount) * 100).toFixed(2));
  }

  private toDateKey(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  private toStartOfDay(date: Date) {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);

    return start;
  }

  private addDays(date: Date, days: number) {
    const nextDate = new Date(date);
    nextDate.setUTCDate(nextDate.getUTCDate() + days);

    return nextDate;
  }
}
