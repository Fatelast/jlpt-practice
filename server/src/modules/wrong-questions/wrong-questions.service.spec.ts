import { NotFoundException } from '@nestjs/common';
import { WrongQuestionsService } from './wrong-questions.service';

describe('WrongQuestionsService', () => {
  it('returns current user unmastered wrong questions formatted for clients', async () => {
    const prisma = {
      wrongQuestion: {
        findMany: jest.fn().mockResolvedValue([
          {
            wrongCount: 2,
            lastWrongAnswer: 'B',
            lastWrongAt: new Date('2026-06-24T10:00:00.000Z'),
            mastered: false,
            question: {
              id: 7n,
              level: 'N5',
              category: 'grammar',
              type: 'grammar_choice',
              stem: 'わたしは学生ではありません。',
              passage: null,
              translation: '我不是学生。',
              explanation: '否定名词句使用「ではありません」。',
              answer: 'A',
              difficulty: 1,
              audioUrl: null,
              audioText: null,
              sourceType: 'original',
              status: 'published',
              options: [
                { optionKey: 'A', optionText: 'では' },
                { optionKey: 'B', optionText: 'に' },
              ],
              questionTags: [{ tag: { name: '基础语法' } }],
              favoriteQuestions: [{ questionId: 7n }],
            },
          },
        ]),
      },
    };
    const service = new WrongQuestionsService(prisma as never);

    await expect(service.getWrongQuestions('3')).resolves.toEqual([
      {
        question: {
          id: '7',
          level: 'N5',
          category: 'grammar',
          type: 'grammar_choice',
          stem: 'わたしは学生ではありません。',
          translation: '我不是学生。',
          explanation: '否定名词句使用「ではありません」。',
          answer: 'A',
          difficulty: 1,
          sourceType: 'original',
          status: 'published',
          options: [
            { key: 'A', text: 'では' },
            { key: 'B', text: 'に' },
          ],
          tags: ['基础语法'],
          isFavorite: true,
        },
        wrongCount: 2,
        lastWrongAnswer: 'B',
        lastWrongAt: '2026-06-24T10:00:00.000Z',
        mastered: false,
      },
    ]);

    expect(prisma.wrongQuestion.findMany).toHaveBeenCalledWith({
      where: {
        userId: 3n,
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
            favoriteQuestions: { where: { userId: 3n } },
          },
        },
      },
      orderBy: { lastWrongAt: 'desc' },
    });
  });

  it('marks current user wrong question as mastered', async () => {
    const prisma = {
      wrongQuestion: {
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const service = new WrongQuestionsService(prisma as never);

    await expect(service.markAsMastered('3', '7')).resolves.toEqual({
      questionId: '7',
      mastered: true,
    });

    expect(prisma.wrongQuestion.update).toHaveBeenCalledWith({
      where: {
        userId_questionId: {
          userId: 3n,
          questionId: 7n,
        },
      },
      data: {
        mastered: true,
        masteredAt: expect.any(Date),
      },
    });
  });

  it('throws when mastering a wrong question that does not belong to current user', async () => {
    const prisma = {
      wrongQuestion: {
        update: jest.fn().mockRejectedValue({ code: 'P2025' }),
      },
    };
    const service = new WrongQuestionsService(prisma as never);

    await expect(service.markAsMastered('3', '99')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
