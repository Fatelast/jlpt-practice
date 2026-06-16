import type { CurrentAdmin, CurrentUser } from './auth';

declare global {
  namespace Express {
    interface Request {
      user?: CurrentUser;
      admin?: CurrentAdmin;
    }
  }
}
