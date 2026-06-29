import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateFeedbackPayload,
  FeedbackItem,
  FeedbackQuestionSnapshot,
} from '@jlpt-practice/shared';
import { toBigIntId } from '../../common/utils/id';
import { PrismaService } from '../../prisma/prisma.service';

type FeedbackWithQuestion = {
  id: bigint;
  questionId: bigint | null;
  type: FeedbackItem['type'];
  content: string;
  status: FeedbackItem['status'];
  handlerRemark: string | null;
  createdAt: Date;
  handledAt: Date | null;
  question: {
    id: bigint;
    level: FeedbackQuestionSnapshot['level'];
    category: FeedbackQuestionSnapshot['category'];
    stem: string;
  } | null;
};

const feedbackQuestionSelect = {
  id: true,
  level: true,
  category: true,
  stem: true,
};

function formatQuestionSnapshot(
  question: FeedbackWithQuestion['question'],
): FeedbackQuestionSnapshot | null {
  if (!question) {
    return null;
  }

  return {
    id: question.id.toString(),
    level: question.level,
    category: question.category,
    stem: question.stem,
  };
}

function formatFeedback(item: FeedbackWithQuestion): FeedbackItem {
  return {
    id: item.id.toString(),
    questionId: item.questionId?.toString() ?? null,
    question: formatQuestionSnapshot(item.question),
    type: item.type,
    content: item.content,
    status: item.status,
    handlerRemark: item.handlerRemark,
    createdAt: item.createdAt.toISOString(),
    handledAt: item.handledAt?.toISOString() ?? null,
  };
}

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async createFeedback(
    userId: string,
    payload: CreateFeedbackPayload,
  ): Promise<FeedbackItem> {
    const content = payload.content.trim();

    if (!content) {
      throw new BadRequestException('反馈内容不能为空');
    }

    const questionId = toBigIntId(payload.questionId, 'questionId');
    const question = await this.prisma.question.findFirst({
      where: {
        id: questionId,
        status: 'published',
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!question) {
      throw new NotFoundException('题目不存在');
    }

    const feedback = await this.prisma.feedback.create({
      data: {
        userId: toBigIntId(userId, 'userId'),
        questionId,
        type: payload.type,
        content,
        status: 'pending',
      },
      include: {
        question: {
          select: feedbackQuestionSelect,
        },
      },
    });

    return formatFeedback(feedback as FeedbackWithQuestion);
  }

  async getMyFeedback(userId: string): Promise<FeedbackItem[]> {
    const feedback = await this.prisma.feedback.findMany({
      where: { userId: toBigIntId(userId, 'userId') },
      include: {
        question: {
          select: feedbackQuestionSelect,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return (feedback as FeedbackWithQuestion[]).map(formatFeedback);
  }
}
