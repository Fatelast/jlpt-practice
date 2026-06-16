import type { JLPTLevel } from '@jlpt-practice/shared';

export interface UserInfo {
  id: string;
  nickname?: string;
  avatarUrl?: string;
  currentLevel: JLPTLevel;
}
