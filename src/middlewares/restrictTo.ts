import { AppError } from "#helpers/appError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export type Role = "user" | "admin" | "guide" | "lead-guide";

export const restrictTo =
  (...roles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role as Role)) {
      return next(new AppError("You are not authroized to perform this action", StatusCodes.FORBIDDEN));
    }

    return next();
  };
