import { AppError } from "#helpers/appError.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const restrictTo =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role as string)) {
      return next(new AppError("You are not authroized to perform this action", StatusCodes.FORBIDDEN));
    }

    return next();
  };
