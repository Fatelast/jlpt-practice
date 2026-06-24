import { Type } from 'class-transformer';
import { IsIn, IsInt, Max, Min } from 'class-validator';
import type { PracticeCategory, PracticeMode } from '@jlpt-practice/shared';

export class GetPracticeQuestionsDto {
  @IsIn(['N5', 'N4'])
  level!: 'N5' | 'N4';

  @IsIn(['moji_goi', 'grammar', 'reading', 'mixed'])
  category!: PracticeCategory;

  @IsIn(['sequence', 'random', 'wrong', 'favorite', 'mock_exam'])
  mode!: PracticeMode;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  count!: number;
}
