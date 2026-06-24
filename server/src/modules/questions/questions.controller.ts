import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';
import type { CurrentUser as CurrentUserPayload } from '../../types/auth';
import { GetPracticeQuestionsDto } from './dto/get-practice-questions.dto';
import { QuestionsService } from './questions.service';

@Controller('questions')
@UseGuards(UserJwtGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get('practice')
  getPracticeQuestions(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: GetPracticeQuestionsDto,
  ) {
    return this.questionsService.getPracticeQuestions(user.id, query);
  }
}
