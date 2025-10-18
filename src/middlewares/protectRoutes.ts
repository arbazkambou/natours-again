import { AppError } from "#helpers/appError.js";
import { catchAsync } from "#helpers/catchAsync.js";
import { isPasswordChangedAfter } from "#helpers/isPasswordChangedAfter.js";
import { User } from "#modules/users/user.model.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

export const protectRoute = catchAsync(async function (req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;
  let token;

  // 1) Check if token exist
  if (authorization && authorization.startsWith("Bearer")) {
    token = authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in", StatusCodes.UNAUTHORIZED));
  }

  // 2) Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

  // 3) Check if user still exists
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError("User does not exist with this token! Please login.", 401));
  }

  // 4) Check if user change his password after issued token
  if (isPasswordChangedAfter(user, decoded.iat)) {
    return next(new AppError("You recently changed your password! Please login again.", 401));
  }

  req.user = user;
  next();
});
