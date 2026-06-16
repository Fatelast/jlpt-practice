export type AdminRole = 'admin' | 'editor' | 'reviewer';

export interface UserJwtPayload {
  sub: string;
  type: 'user';
}

export interface AdminJwtPayload {
  sub: string;
  type: 'admin';
  role: AdminRole;
}

export type AuthJwtPayload = UserJwtPayload | AdminJwtPayload;

export interface CurrentUser {
  id: string;
  type: 'user';
}

export interface CurrentAdmin {
  id: string;
  type: 'admin';
  role: AdminRole;
}
