import { NotFoundException } from '@nestjs/common';
import { FeedbackService } from './feedback.service';

describe('FeedbackService', () => {
  it('creates feedback for a published question', async () => {
    const createdAt = new Date('2026-06-29T08:00:00.000Z');
    const prisma = {
      question: {
        findFirst: jest.fn().mockResolvedValue({ id: 8n }),
      },
      feedback: {
        create: jest.fn().mockResolvedValue({
          id: 12n,
          questionId: 8n,
          type: 'answer_error',
          content: '正确答案似乎不对',
          status: 'pending',
          handlerRemark: null,
          createdAt,
          handledAt: null,
          question: {
            id: 8n,
            level: 'N5',
            category: 'grammar',
            stem: 'わたしは毎朝7時（ ）起きます。',
          },
        }),
      },
    };
    const service = new FeedbackService(prisma as never);

    await expect(
      service.createFeedback('3', {
        questionId: '8',
        type: 'answer_error',
        content: '正确答案似乎不对',
      }),
    ).resolves.toEqual({
      id: '12',
      questionId: '8',
      question: {
        id: '8',
        level: 'N5',
        category: 'grammar',
        stem: 'わたしは毎朝7時（ ）起きます。',
      },
      type: 'answer_error',
      content: '正确答案似乎不对',
      status: 'pending',
      handlerRemark: null,
      createdAt: createdAt.toISOString(),
      handledAt: null,
    });

    expect(prisma.question.findFirst).toHaveBeenCalledWith({
      where: {
        id: 8n,
        status: 'published',
        deletedAt: null,
      },
      select: { id: true },
    });
    expect(prisma.feedback.create).toHaveBeenCalledWith({
      data: {
        userId: 3n,
        questionId: 8n,
        type: 'answer_error',
        content: '正确答案似乎不对',
        status: 'pending',
      },
      include: {
        question: {
          select: {
            id: true,
            level: true,
            category: true,
            stem: true,
          },
        },
      },
    });
  });

  it('throws when creating feedback for a missing or unavailable question', async () => {
    const prisma = {
      question: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      feedback: {
        create: jest.fn(),
      },
    };
    const service = new FeedbackService(prisma as never);

    await expect(
      service.createFeedback('3', {
        questionId: '99',
        type: 'stem_error',
        content: '题干有问题',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.feedback.create).not.toHaveBeenCalled();
  });

  it('returns current user feedback ordered by latest submission', async () => {
    const firstCreatedAt = new Date('2026-06-29T08:00:00.000Z');
    const secondCreatedAt = new Date('2026-06-28T08:00:00.000Z');
    const handledAt = new Date('2026-06-29T10:00:00.000Z');
    const prisma = {
      feedback: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 12n,
            questionId: 8n,
            type: 'answer_error',
            content: '正确答案似乎不对',
            status: 'pending',
            handlerRemark: null,
            createdAt: firstCreatedAt,
            handledAt: null,
            question: {
              id: 8n,
              level: 'N5',
              category: 'grammar',
              stem: 'わたしは毎朝7時（ ）起きます。',
            },
          },
          {
            id: 11n,
            questionId: 7n,
            type: 'translation_error',
            content: '翻译不够准确',
            status: 'resolved',
            handlerRemark: '已调整',
            createdAt: secondCreatedAt,
            handledAt,
            question: {
              id: 7n,
              level: 'N5',
              category: 'moji_goi',
              stem: 'これは本です。',
            },
          },
        ]),
      },
    };
    const service = new FeedbackService(prisma as never);

    await expect(service.getMyFeedback('3')).resolves.toEqual([
      {
        id: '12',
        questionId: '8',
        question: {
          id: '8',
          level: 'N5',
          category: 'grammar',
          stem: 'わたしは毎朝7時（ ）起きます。',
        },
        type: 'answer_error',
        content: '正确答案似乎不对',
        status: 'pending',
        handlerRemark: null,
        createdAt: firstCreatedAt.toISOString(),
        handledAt: null,
      },
      {
        id: '11',
        questionId: '7',
        question: {
          id: '7',
          level: 'N5',
          category: 'moji_goi',
          stem: 'これは本です。',
        },
        type: 'translation_error',
        content: '翻译不够准确',
        status: 'resolved',
        handlerRemark: '已调整',
        createdAt: secondCreatedAt.toISOString(),
        handledAt: handledAt.toISOString(),
      },
    ]);

    expect(prisma.feedback.findMany).toHaveBeenCalledWith({
      where: { userId: 3n },
      include: {
        question: {
          select: {
            id: true,
            level: true,
            category: true,
            stem: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  });
});
