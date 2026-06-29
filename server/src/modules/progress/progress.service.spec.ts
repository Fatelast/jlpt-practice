import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  const referenceDate = new Date('2026-06-26T12:00:00.000Z');

  it('returns summary, recent days, and category mastery for current user', async () => {
    const prisma = {
      answerRecord: {
        findMany: jest.fn().mockResolvedValue([
          {
            isCorrect: true,
            answeredAt: new Date('2026-06-18T02:00:00.000Z'),
            question: { category: 'moji_goi' },
          },
          {
            isCorrect: true,
            answeredAt: new Date('2026-06-20T02:00:00.000Z'),
            question: { category: 'reading' },
          },
          {
            isCorrect: false,
            answeredAt: new Date('2026-06-24T02:00:00.000Z'),
            question: { category: 'reading' },
          },
          {
            isCorrect: true,
            answeredAt: new Date('2026-06-25T02:00:00.000Z'),
            question: { category: 'grammar' },
          },
          {
            isCorrect: true,
            answeredAt: new Date('2026-06-26T02:00:00.000Z'),
            question: { category: 'moji_goi' },
          },
          {
            isCorrect: false,
            answeredAt: new Date('2026-06-26T03:00:00.000Z'),
            question: { category: 'grammar' },
          },
        ]),
      },
      wrongQuestion: {
        count: jest.fn().mockResolvedValue(2),
      },
    };
    const service = new ProgressService(prisma as never);

    await expect(service.getSummary('3', referenceDate)).resolves.toEqual({
      overview: {
        totalAnswered: 6,
        correctCount: 4,
        accuracy: 66.67,
        wrongQuestionCount: 2,
        todayAnswered: 2,
        streakDays: 3,
      },
      recentDays: [
        { date: '2026-06-20', answeredCount: 1, correctCount: 1, wrongCount: 0, accuracy: 100 },
        { date: '2026-06-21', answeredCount: 0, correctCount: 0, wrongCount: 0, accuracy: 0 },
        { date: '2026-06-22', answeredCount: 0, correctCount: 0, wrongCount: 0, accuracy: 0 },
        { date: '2026-06-23', answeredCount: 0, correctCount: 0, wrongCount: 0, accuracy: 0 },
        { date: '2026-06-24', answeredCount: 1, correctCount: 0, wrongCount: 1, accuracy: 0 },
        { date: '2026-06-25', answeredCount: 1, correctCount: 1, wrongCount: 0, accuracy: 100 },
        { date: '2026-06-26', answeredCount: 2, correctCount: 1, wrongCount: 1, accuracy: 50 },
      ],
      categoryMastery: [
        { category: 'moji_goi', answeredCount: 2, correctCount: 2, wrongCount: 0, accuracy: 100 },
        { category: 'grammar', answeredCount: 2, correctCount: 1, wrongCount: 1, accuracy: 50 },
        { category: 'reading', answeredCount: 2, correctCount: 1, wrongCount: 1, accuracy: 50 },
      ],
    });

    expect(prisma.answerRecord.findMany).toHaveBeenCalledWith({
      where: { userId: 3n },
      include: {
        question: {
          select: {
            category: true,
          },
        },
      },
      orderBy: { answeredAt: 'asc' },
    });
    expect(prisma.wrongQuestion.count).toHaveBeenCalledWith({
      where: {
        userId: 3n,
        mastered: false,
        question: {
          status: 'published',
          deletedAt: null,
        },
      },
    });
  });

  it('returns zero-filled summary when user has no answers', async () => {
    const prisma = {
      answerRecord: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      wrongQuestion: {
        count: jest.fn().mockResolvedValue(0),
      },
    };
    const service = new ProgressService(prisma as never);

    const summary = await service.getSummary('3', referenceDate);

    expect(summary.overview).toEqual({
      totalAnswered: 0,
      correctCount: 0,
      accuracy: 0,
      wrongQuestionCount: 0,
      todayAnswered: 0,
      streakDays: 0,
    });
    expect(summary.recentDays).toHaveLength(7);
    expect(summary.recentDays[0].date).toBe('2026-06-20');
    expect(summary.recentDays[6].date).toBe('2026-06-26');
    expect(summary.categoryMastery).toEqual([
      { category: 'moji_goi', answeredCount: 0, correctCount: 0, wrongCount: 0, accuracy: 0 },
      { category: 'grammar', answeredCount: 0, correctCount: 0, wrongCount: 0, accuracy: 0 },
      { category: 'reading', answeredCount: 0, correctCount: 0, wrongCount: 0, accuracy: 0 },
    ]);
  });
});
