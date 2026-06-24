import { QuestionsService } from './questions.service';

describe('QuestionsService', () => {
  it('returns published practice questions formatted for clients', async () => {
    const prisma = {
      question: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 7n,
            level: 'N5',
            category: 'grammar',
            type: 'grammar_choice',
            stem: 'わたしは学生（　）ありません。',
            passage: null,
            translation: '我不是学生。',
            explanation: '否定名词句使用「ではありません」。',
            answer: 'B',
            difficulty: 1,
            audioUrl: null,
            audioText: null,
            sourceType: 'original',
            status: 'published',
            options: [
              { optionKey: 'A', optionText: 'です' },
              { optionKey: 'B', optionText: 'では' },
            ],
            questionTags: [{ tag: { name: '基础语法' } }],
            favoriteQuestions: [{ questionId: 7n }],
          },
        ]),
      },
    };
    const service = new QuestionsService(prisma as never);

    await expect(
      service.getPracticeQuestions('3', {
        level: 'N5',
        category: 'grammar',
        mode: 'sequence',
        count: 10,
      }),
    ).resolves.toEqual([
      {
        id: '7',
        level: 'N5',
        category: 'grammar',
        type: 'grammar_choice',
        stem: 'わたしは学生（　）ありません。',
        translation: '我不是学生。',
        explanation: '否定名词句使用「ではありません」。',
        answer: 'B',
        difficulty: 1,
        sourceType: 'original',
        status: 'published',
        options: [
          { key: 'A', text: 'です' },
          { key: 'B', text: 'では' },
        ],
        tags: ['基础语法'],
        isFavorite: true,
      },
    ]);

    expect(prisma.question.findMany).toHaveBeenCalledWith({
      where: {
        level: 'N5',
        category: 'grammar',
        status: 'published',
        deletedAt: null,
      },
      include: {
        options: { orderBy: { sortOrder: 'asc' } },
        questionTags: { include: { tag: true } },
        favoriteQuestions: { where: { userId: 3n } },
      },
      orderBy: { id: 'asc' },
      take: 10,
    });
  });
});
