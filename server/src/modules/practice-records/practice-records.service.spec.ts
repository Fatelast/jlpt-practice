import { NotFoundException } from '@nestjs/common';
import { PracticeRecordsService } from './practice-records.service';

describe('PracticeRecordsService', () => {
  it('creates a practice record from selected question ids', async () => {
    const prisma = {
      practiceRecord: {
        create: jest.fn().mockResolvedValue({ id: 5n }),
      },
    };
    const service = new PracticeRecordsService(prisma as never);

    await expect(
      service.createPracticeRecord('3', {
        level: 'N5',
        category: 'grammar',
        mode: 'sequence',
        questionIds: ['7', '8'],
      }),
    ).resolves.toEqual({ practiceRecordId: '5' });

    expect(prisma.practiceRecord.create).toHaveBeenCalledWith({
      data: {
        userId: 3n,
        level: 'N5',
        category: 'grammar',
        mode: 'sequence',
        totalCount: 2,
        status: 'in_progress',
      },
    });
  });

  it('records a wrong answer and returns the answer analysis', async () => {
    const prisma = {
      question: {
        findFirst: jest.fn().mockResolvedValue({
          id: 7n,
          answer: 'A',
          explanation: '具体时间点用「に」。',
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      answerRecord: {
        create: jest.fn().mockResolvedValue({}),
      },
      wrongQuestion: {
        upsert: jest.fn().mockResolvedValue({}),
      },
    };
    const service = new PracticeRecordsService(prisma as never);

    await expect(
      service.submitAnswer('3', '5', {
        questionId: '7',
        selectedAnswer: 'B',
        durationSeconds: 12,
      }),
    ).resolves.toEqual({
      questionId: '7',
      selectedAnswer: 'B',
      correctAnswer: 'A',
      isCorrect: false,
      explanation: '具体时间点用「に」。',
    });

    expect(prisma.answerRecord.create).toHaveBeenCalledWith({
      data: {
        practiceRecordId: 5n,
        userId: 3n,
        questionId: 7n,
        selectedAnswer: 'B',
        correctAnswer: 'A',
        isCorrect: false,
        durationSeconds: 12,
      },
    });
    expect(prisma.wrongQuestion.upsert).toHaveBeenCalledWith({
      where: {
        userId_questionId: {
          userId: 3n,
          questionId: 7n,
        },
      },
      update: {
        wrongCount: { increment: 1 },
        lastWrongAnswer: 'B',
        mastered: false,
        lastWrongAt: expect.any(Date),
      },
      create: {
        userId: 3n,
        questionId: 7n,
        lastWrongAnswer: 'B',
      },
    });
  });

  it('throws when submitting an unpublished question', async () => {
    const prisma = {
      question: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };
    const service = new PracticeRecordsService(prisma as never);

    await expect(
      service.submitAnswer('3', '5', {
        questionId: '99',
        selectedAnswer: 'A',
        durationSeconds: 1,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
