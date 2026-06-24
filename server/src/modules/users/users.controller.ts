import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';
import type { CurrentUser as CurrentUserPayload } from '../../types/auth';
import { UpdateCurrentLevelDto } from './dto/update-current-level.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(UserJwtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getCurrentUser(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.getCurrentUser(user.id);
  }

  @Patch('current-level')
  updateCurrentLevel(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: UpdateCurrentLevelDto,
  ) {
    return this.usersService.updateCurrentLevel(user.id, body);
  }
}
