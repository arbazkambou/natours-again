import { userSchema } from "#modules/users/user.model.ts";
import { User } from "@prisma/client";
import { InferSchemaType } from "mongoose";

export type UserType = InferSchemaType<typeof userSchema>;

declare global {
  namespace Express {
    interface Request {
      user?: User;
      requestTime?: string;
    }
  }
}

declare module "xss-clean" {
  import { RequestHandler } from "express";
  const value: () => RequestHandler;
  export default value;
}
