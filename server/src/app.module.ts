import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { envConfig } from './config/env';
import { AuthModule } from './modules/auth/auth.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { PracticeRecordsModule } from './modules/practice-records/practice-records.module';
import { ProgressModule } from './modules/progress/progress.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { UsersModule } from './modules/users/users.module';
import { WrongQuestionsModule } from './modules/wrong-questions/wrong-questions.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    AuthModule,
    FavoritesModule,
    FeedbackModule,
    UsersModule,
    QuestionsModule,
    WrongQuestionsModule,
    ProgressModule,
    PracticeRecordsModule,
    PrismaModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
