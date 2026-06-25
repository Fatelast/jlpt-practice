import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';
import type { CurrentUser as CurrentUserPayload } from '../../types/auth';
import { WrongQuestionsService } from './wrong-questions.service';

@Controller('wrong-questions')
@UseGuards(UserJwtGuard)
export class WrongQuestionsController {
  constructor(private readonly wrongQuestionsService: WrongQuestionsService) {}

  @Get()
  getWrongQuestions(@CurrentUser() user: CurrentUserPayload) {
    return this.wrongQuestionsService.getWrongQuestions(user.id);
  }

  @Patch(':questionId/mastered')
  markAsMastered(
    @CurrentUser() user: CurrentUserPayload,
    @Param('questionId') questionId: string,
  ) {
    return this.wrongQuestionsService.markAsMastered(user.id, questionId);
  }
}
