import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { WrongQuestionsController } from './wrong-questions.controller';
import { WrongQuestionsService } from './wrong-questions.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [WrongQuestionsController],
  providers: [WrongQuestionsService],
})
export class WrongQuestionsModule {}
