import { Injectable, NotFoundException } from '@nestjs/common';
import { toBigIntId } from '../../common/utils/id';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreatePracticeRecordDto } from './dto/create-practice-record.dto';
import type { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class PracticeRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPracticeRecord(userId: string, data: CreatePracticeRecordDto) {
    const record = await this.prisma.practiceRecord.create({
      data: {
        userId: toBigIntId(userId, 'userId'),
        level: data.level,
        category: data.category,
        mode: data.mode,
        totalCount: data.questionIds.length,
        status: 'in_progress',
      },
    });

    return { practiceRecordId: String(record.id) };
  }

  async submitAnswer(
    userId: string,
    practiceRecordId: string,
    data: SubmitAnswerDto,
  ) {
    const userBigIntId = toBigIntId(userId, 'userId');
    const recordBigIntId = toBigIntId(practiceRecordId, 'practiceRecordId');
    const questionBigIntId = toBigIntId(data.questionId, 'questionId');
    const question = await this.prisma.question.findFirst({
      where: {
        id: questionBigIntId,
        status: 'published',
        deletedAt: null,
      },
    });

    if (!question) {
      throw new NotFoundException('题目不存在');
    }

    const isCorrect = data.selectedAnswer === question.answer;

    await this.prisma.answerRecord.create({
      data: {
        practiceRecordId: recordBigIntId,
        userId: userBigIntId,
        questionId: questionBigIntId,
        selectedAnswer: data.selectedAnswer,
        correctAnswer: question.answer,
        isCorrect,
        durationSeconds: data.durationSeconds,
      },
    });

    await this.prisma.question.update({
      where: { id: questionBigIntId },
      data: {
        totalAttempts: { increment: 1 },
        correctAttempts: { increment: isCorrect ? 1 : 0 },
      },
    });

    if (!isCorrect) {
      await this.prisma.wrongQuestion.upsert({
        where: {
          userId_questionId: {
            userId: userBigIntId,
            questionId: questionBigIntId,
          },
        },
        update: {
          wrongCount: { increment: 1 },
          lastWrongAnswer: data.selectedAnswer,
          mastered: false,
          lastWrongAt: new Date(),
        },
        create: {
          userId: userBigIntId,
          questionId: questionBigIntId,
          lastWrongAnswer: data.selectedAnswer,
        },
      });
    }

    return {
      questionId: data.questionId,
      selectedAnswer: data.selectedAnswer,
      correctAnswer: question.answer,
      isCorrect,
      explanation: question.explanation,
    };
  }

  async finishPracticeRecord(userId: string, practiceRecordId: string) {
    const userBigIntId = toBigIntId(userId, 'userId');
    const recordBigIntId = toBigIntId(practiceRecordId, 'practiceRecordId');
    const answers = await this.prisma.answerRecord.findMany({
      where: {
        practiceRecordId: recordBigIntId,
        userId: userBigIntId,
      },
    });
    const correctCount = answers.filter((answer) => answer.isCorrect).length;
    const totalCount = answers.length;
    const wrongCount = totalCount - correctCount;
    const durationSeconds = answers.reduce(
      (total, answer) => total + answer.durationSeconds,
      0,
    );
    const accuracy =
      totalCount === 0 ? 0 : Number(((correctCount / totalCount) * 100).toFixed(2));

    const record = await this.prisma.practiceRecord.update({
      where: { id: recordBigIntId },
      data: {
        totalCount,
        correctCount,
        wrongCount,
        accuracy,
        durationSeconds,
        status: 'finished',
        finishedAt: new Date(),
      },
    });

    return {
      id: String(record.id),
      totalCount,
      correctCount,
      wrongCount,
      accuracy,
      durationSeconds,
      status: record.status,
      finishedAt: record.finishedAt?.toISOString(),
    };
  }
}
