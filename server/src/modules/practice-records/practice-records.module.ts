import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PracticeRecordsController } from './practice-records.controller';
import { PracticeRecordsService } from './practice-records.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [PracticeRecordsController],
  providers: [PracticeRecordsService],
})
export class PracticeRecordsModule {}
