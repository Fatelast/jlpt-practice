import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';
import type { CurrentUser as CurrentUserPayload } from '../../types/auth';
import { ProgressService } from './progress.service';

@Controller('progress')
@UseGuards(UserJwtGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: CurrentUserPayload) {
    return this.progressService.getSummary(user.id);
  }
}
