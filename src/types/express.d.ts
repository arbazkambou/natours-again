import { userSchema } from "#modules/users/user.model.ts";
import { InferSchemaType } from "mongoose";

export type UserType = InferSchemaType<typeof userSchema>;

declare global {
  namespace Express {
    interface Request {
      user?: UserType;
      requestTime?: string;
    }
  }
}

declare module "xss-clean" {
  import { RequestHandler } from "express";
  const value: () => RequestHandler;
  export default value;
}
