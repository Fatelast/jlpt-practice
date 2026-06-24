import { IsIn } from 'class-validator';
import type { JLPTLevel } from '@jlpt-practice/shared';

export class UpdateCurrentLevelDto {
  @IsIn(['N5', 'N4', 'N3', 'N2', 'N1'])
  level!: JLPTLevel;
}
