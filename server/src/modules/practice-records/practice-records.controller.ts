import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';
import type { CurrentUser as CurrentUserPayload } from '../../types/auth';
import { CreatePracticeRecordDto } from './dto/create-practice-record.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { PracticeRecordsService } from './practice-records.service';

@Controller('practice-records')
@UseGuards(UserJwtGuard)
export class PracticeRecordsController {
  constructor(
    private readonly practiceRecordsService: PracticeRecordsService,
  ) {}

  @Post()
  createPracticeRecord(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: CreatePracticeRecordDto,
  ) {
    return this.practiceRecordsService.createPracticeRecord(user.id, body);
  }

  @Post(':id/answers')
  submitAnswer(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() body: SubmitAnswerDto,
  ) {
    return this.practiceRecordsService.submitAnswer(user.id, id, body);
  }

  @Post(':id/finish')
  finishPracticeRecord(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.practiceRecordsService.finishPracticeRecord(user.id, id);
  }
}
