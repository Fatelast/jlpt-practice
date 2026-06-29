import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { FEEDBACK_TYPES, type FeedbackType } from '@jlpt-practice/shared';

export class CreateFeedbackDto {
  @IsString()
  questionId!: string;

  @IsIn(FEEDBACK_TYPES)
  type!: FeedbackType;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content!: string;
}
