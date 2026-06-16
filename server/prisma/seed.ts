import { PrismaClient } from '@prisma/client';
import { envConfig } from '../src/config/env';
import { hashPassword } from '../src/common/utils/password';

const prisma = new PrismaClient();

const defaultTags = [
  { name: '助词', category: 'grammar' },
  { name: '动词变形', category: 'grammar' },
  { name: '形容词', category: 'grammar' },
  { name: '名词', category: 'moji_goi' },
  { name: '副词', category: 'moji_goi' },
  { name: '时间表达', category: 'grammar' },
  { name: '数量词', category: 'moji_goi' },
  { name: '汉字读音', category: 'moji_goi' },
  { name: '词义辨析', category: 'moji_goi' },
  { name: '基础语法', category: 'grammar' },
  { name: '阅读理解', category: 'reading' },
  { name: '日常表达', category: 'grammar' },
  { name: '句子排序', category: 'grammar' },
  { name: '文章语法', category: 'grammar' },
];

const originalQuestions = [
  {
    level: 'N5',
    category: 'grammar',
    type: 'grammar_choice',
    stem: 'わたしは 毎朝 7時（　）起きます。',
    options: [
      { key: 'A', text: 'に' },
      { key: 'B', text: 'で' },
      { key: 'C', text: 'を' },
      { key: 'D', text: 'が' },
    ],
    answer: 'A',
    explanation: '表示具体时间点时使用助词「に」。',
    translation: '我每天早上 7 点起床。',
    difficulty: 1,
    tags: ['助词', '时间表达'],
  },
  {
    level: 'N5',
    category: 'moji_goi',
    type: 'kanji_reading',
    stem: '「学校」の読み方として正しいものを選びなさい。',
    options: [
      { key: 'A', text: 'がっこう' },
      { key: 'B', text: 'がこう' },
      { key: 'C', text: 'かっこう' },
      { key: 'D', text: 'かこう' },
    ],
    answer: 'A',
    explanation: '「学校」读作「がっこう」。',
    translation: '请选择“学校”的正确读音。',
    difficulty: 1,
    tags: ['汉字读音'],
  },
  {
    level: 'N4',
    category: 'reading',
    type: 'reading_choice',
    stem: '本文の内容と合っているものを選びなさい。',
    passage:
      'きのう、田中さんは図書館へ行きました。日本語の本を二冊借りて、三時間勉強しました。',
    options: [
      { key: 'A', text: '田中さんは映画館へ行きました。' },
      { key: 'B', text: '田中さんは本を二冊借りました。' },
      { key: 'C', text: '田中さんは一時間勉強しました。' },
      { key: 'D', text: '田中さんは英語の本を借りました。' },
    ],
    answer: 'B',
    explanation: '文章中写到「日本語の本を二冊借りて」。',
    translation: '昨天田中去了图书馆，借了两本日语书并学习了三个小时。',
    difficulty: 2,
    tags: ['阅读理解'],
  },
];

async function seedAdmin() {
  const config = envConfig();
  const username = config.admin.initialUsername;
  const password = config.admin.initialPassword;

  const existingAdmin = await prisma.admin.findUnique({
    where: { username },
  });

  if (existingAdmin) {
    return;
  }

  await prisma.admin.create({
    data: {
      username,
      passwordHash: hashPassword(password),
      role: 'admin',
    },
  });
}

async function seedTags() {
  for (const tag of defaultTags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {
        category: tag.category,
        status: 'active',
      },
      create: {
        name: tag.name,
        category: tag.category,
      },
    });
  }
}

async function seedQuestions() {
  for (const question of originalQuestions) {
    const existingQuestion = await prisma.question.findFirst({
      where: {
        stem: question.stem,
        sourceType: 'original',
      },
    });

    if (existingQuestion) {
      continue;
    }

    const tags = await prisma.tag.findMany({
      where: {
        name: {
          in: question.tags,
        },
      },
    });

    await prisma.question.create({
      data: {
        level: question.level,
        category: question.category,
        type: question.type,
        stem: question.stem,
        passage: 'passage' in question ? question.passage : undefined,
        translation: question.translation,
        explanation: question.explanation,
        answer: question.answer,
        difficulty: question.difficulty,
        sourceType: 'original',
        status: 'published',
        publishedAt: new Date(),
        options: {
          create: question.options.map((option, index) => ({
            optionKey: option.key,
            optionText: option.text,
            sortOrder: index + 1,
          })),
        },
        questionTags: {
          create: tags.map((tag) => ({
            tagId: tag.id,
          })),
        },
      },
    });
  }
}

async function main() {
  await seedAdmin();
  await seedTags();
  await seedQuestions();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
