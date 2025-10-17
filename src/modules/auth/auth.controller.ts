import { AppError } from "#helpers/appError.js";
import { catchAsync } from "#helpers/catchAsync.js";
import { generateJWT } from "#helpers/generateJWT.js";
import { isPasswordChangedAfter } from "#helpers/isPasswordChangedAfter.js";
import { User } from "#modules/users/user.model.js";
import { UserType } from "#modules/users/user.schema.js";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

export const signUp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, name, password, photo, confirmPassword, passwordChangedAt } = req.body as UserType;

  const newUser = await User.create({ email, name, password, confirmPassword, photo, passwordChangedAt });

  const token = generateJWT(newUser._id);

  return res.status(StatusCodes.CREATED).json({
    status: true,
    token,
    data: { user: { email: newUser.email, name: newUser.email, photo: newUser.photo, passwordChangedAt: newUser.passwordChangedAt } },
  });
});

export const signIn = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  //1. Check if email and password exist in body
  if (!email || !password) {
    return next(new AppError("Please enter email and password", 400));
  }

  //2. Check if user exist and password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return next(new AppError("Invalid email or password", 401));
  }

  //3. Login the user
  return res.status(StatusCodes.OK).json({ status: true, message: "Login successfully", token: generateJWT(user._id) });
});

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
