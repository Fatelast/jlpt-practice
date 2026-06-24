import { ArrayMinSize, IsArray, IsIn, IsString } from 'class-validator';
import type { PracticeCategory, PracticeMode } from '@jlpt-practice/shared';

export class CreatePracticeRecordDto {
  @IsIn(['N5', 'N4'])
  level!: 'N5' | 'N4';

  @IsIn(['moji_goi', 'grammar', 'reading', 'mixed'])
  category!: PracticeCategory;

  @IsIn(['sequence', 'random', 'wrong', 'favorite', 'mock_exam'])
  mode!: PracticeMode;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  questionIds!: string[];
}
