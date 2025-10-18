import { UserType } from "#modules/users/user.schema.ts";

declare global {
  namespace Express {
    interface Request {
      user?: UserType;
      requestTime?: string;
    }
  }
}
