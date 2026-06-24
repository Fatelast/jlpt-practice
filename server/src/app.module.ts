import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { envConfig } from './config/env';
import { AuthModule } from './modules/auth/auth.module';
import { PracticeRecordsModule } from './modules/practice-records/practice-records.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    AuthModule,
    UsersModule,
    QuestionsModule,
    PracticeRecordsModule,
    PrismaModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
