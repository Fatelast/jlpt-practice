import { NotFoundException } from '@nestjs/common';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  it('returns current user favorite questions formatted for clients', async () => {
    const prisma = {
      favoriteQuestion: {
        findMany: jest.fn().mockResolvedValue([
          {
            question: {
              id: 8n,
              level: 'N5',
              category: 'moji_goi',
              type: 'word_context',
              stem: 'これは（ ）です。',
              passage: null,
              translation: '这是书。',
              explanation: '「本」表示书。',
              answer: 'A',
              difficulty: 1,
              audioUrl: null,
              audioText: null,
              sourceType: 'original',
              status: 'published',
              options: [
                { optionKey: 'A', optionText: '本' },
                { optionKey: 'B', optionText: '水' },
              ],
              questionTags: [{ tag: { name: '名词' } }],
              favoriteQuestions: [{ questionId: 8n }],
            },
          },
        ]),
      },
    };
    const service = new FavoritesService(prisma as never);

    await expect(service.getFavorites('3')).resolves.toEqual([
      {
        id: '8',
        level: 'N5',
        category: 'moji_goi',
        type: 'word_context',
        stem: 'これは（ ）です。',
        translation: '这是书。',
        explanation: '「本」表示书。',
        answer: 'A',
        difficulty: 1,
        sourceType: 'original',
        status: 'published',
        options: [
          { key: 'A', text: '本' },
          { key: 'B', text: '水' },
        ],
        tags: ['名词'],
        isFavorite: true,
      },
    ]);

    expect(prisma.favoriteQuestion.findMany).toHaveBeenCalledWith({
      where: {
        userId: 3n,
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
      orderBy: { createdAt: 'desc' },
    });
  });

  it('favorites a published question for current user', async () => {
    const prisma = {
      question: {
        findFirst: jest.fn().mockResolvedValue({ id: 8n }),
      },
      favoriteQuestion: {
        upsert: jest.fn().mockResolvedValue({}),
      },
    };
    const service = new FavoritesService(prisma as never);

    await expect(service.favoriteQuestion('3', '8')).resolves.toEqual({
      questionId: '8',
      isFavorite: true,
    });

    expect(prisma.question.findFirst).toHaveBeenCalledWith({
      where: {
        id: 8n,
        status: 'published',
        deletedAt: null,
      },
      select: { id: true },
    });
    expect(prisma.favoriteQuestion.upsert).toHaveBeenCalledWith({
      where: {
        userId_questionId: {
          userId: 3n,
          questionId: 8n,
        },
      },
      update: {},
      create: {
        userId: 3n,
        questionId: 8n,
      },
    });
  });

  it('throws when favoriting a missing or unavailable question', async () => {
    const prisma = {
      question: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      favoriteQuestion: {
        upsert: jest.fn(),
      },
    };
    const service = new FavoritesService(prisma as never);

    await expect(service.favoriteQuestion('3', '99')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.favoriteQuestion.upsert).not.toHaveBeenCalled();
  });

  it('unfavorites current user question', async () => {
    const prisma = {
      favoriteQuestion: {
        delete: jest.fn().mockResolvedValue({}),
      },
    };
    const service = new FavoritesService(prisma as never);

    await expect(service.unfavoriteQuestion('3', '8')).resolves.toEqual({
      questionId: '8',
      isFavorite: false,
    });

    expect(prisma.favoriteQuestion.delete).toHaveBeenCalledWith({
      where: {
        userId_questionId: {
          userId: 3n,
          questionId: 8n,
        },
      },
    });
  });

  it('does not fail when unfavoriting a question that is not favorited', async () => {
    const prisma = {
      favoriteQuestion: {
        delete: jest.fn().mockRejectedValue({ code: 'P2025' }),
      },
    };
    const service = new FavoritesService(prisma as never);

    await expect(service.unfavoriteQuestion('3', '8')).resolves.toEqual({
      questionId: '8',
      isFavorite: false,
    });
  });
});
