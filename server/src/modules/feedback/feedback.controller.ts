import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';
import type { CurrentUser as CurrentUserPayload } from '../../types/auth';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
@UseGuards(UserJwtGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  createFeedback(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: CreateFeedbackDto,
  ) {
    return this.feedbackService.createFeedback(user.id, body);
  }

  @Get('my')
  getMyFeedback(@CurrentUser() user: CurrentUserPayload) {
    return this.feedbackService.getMyFeedback(user.id);
  }
}
