import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserJwtGuard } from '../../common/guards/user-jwt.guard';
import type { CurrentUser as CurrentUserPayload } from '../../types/auth';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(UserJwtGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getFavorites(@CurrentUser() user: CurrentUserPayload) {
    return this.favoritesService.getFavorites(user.id);
  }

  @Post(':questionId')
  favoriteQuestion(
    @CurrentUser() user: CurrentUserPayload,
    @Param('questionId') questionId: string,
  ) {
    return this.favoritesService.favoriteQuestion(user.id, questionId);
  }

  @Delete(':questionId')
  unfavoriteQuestion(
    @CurrentUser() user: CurrentUserPayload,
    @Param('questionId') questionId: string,
  ) {
    return this.favoritesService.unfavoriteQuestion(user.id, questionId);
  }
}
