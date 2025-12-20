import { AppError } from "#helpers/appError.js";
import { catchAsync } from "#helpers/catchAsync.js";
import { createAndSendToken } from "#helpers/createAndSendToken.js";
import Email from "#helpers/sendEmail.js";
import { prisma } from "#lib/prisma.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

export const signUp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, name, password, photo } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    if (!user.active) {
      return next(new AppError("You have already registerd. Please confirm your email to activate your account", StatusCodes.BAD_REQUEST));
    }

    return next(new AppError("A user with this email address is already registered! Try another one.", StatusCodes.BAD_REQUEST));
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = await prisma.user.create({
    data: { email, name, password: hashedPassword, photo },
    // select: { id, email, name, photo,  },
  });

  const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET as string, { expiresIn: "10m" });
  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/confirm-email/${token}/user/${newUser.id}`;

  await new Email({ email: newUser.email, name: newUser.name }).sendVerificationCode(resetUrl);
  return res.status(StatusCodes.OK).json({ status: true, message: "Please confirm your email to activate your account" });
});

export const signIn = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  //1. Check if email and password exist in body
  if (!email || !password) {
    return next(new AppError("Please enter email and password", 400));
  }

  //2. Check if user exist and password is correct
  // const user = await User.findOne({ email }).select("+password +active");
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return next(new AppError("Invalid email or password", 401));
  }

  if (user.active === "InActive") {
    return next(new AppError("Please activate your acoount", 401));
  }

  //3. Login the user
  // return res.status(StatusCodes.OK).json({ status: true, message: "Login successfully", token: generateJWT(user._id) });

  return createAndSendToken({ user, statusCode: StatusCodes.OK, message: "Login successfully", res });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  // 1) Check if user exist
  // const user = await User.findOne({ email });
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return next(new AppError("No user found with this email", StatusCodes.NOT_FOUND));
  }

  // 2) Create password reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  const tokenExpiredAt = new Date(Date.now() + 10 * 60 * 1000);

  // user.passwordResetToken = hashedToken;
  // user.passwordResetTokenExprire = tokenExpiredAt;
  // await user.save({ validateBeforeSave: false });
  await prisma.user.update({ where: { id: user.id }, data: { passwordResetToken: hashedToken, passwordResetTokenExprire: tokenExpiredAt } });

  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/reset-password/${resetToken}`;

  try {
    await new Email({ name: user.name, email: user.email }, resetUrl).sendPasswordReset(resetUrl);
  } catch {
    await prisma.user.update({ where: { id: user.id }, data: { passwordResetToken: null, passwordResetTokenExprire: null } });
  }

  return res.status(200).json({ status: true, message: "Reset token send to mail seccessfully!" });
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get token from request params and create hashed token
  const { token } = req.params;
  if (!token) {
    return next(new AppError("Invalid password reset token", StatusCodes.BAD_REQUEST));
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 2) Check if user exist and token has not expired
  // const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetTokenExprire: { $gte: Date.now() } });
  const user = await prisma.user.findFirst({ where: { passwordResetToken: hashedToken, passwordResetTokenExprire: { gte: new Date(Date.now()) } } });
  if (!user) {
    return next(new AppError("Token is inavlid or has been expired", StatusCodes.BAD_REQUEST));
  }

  // 3) Update the password
  const { password } = req.body;
  // user.password = password;
  // user.confirmPassword = confirmPassword;
  // user.passwordResetToken = undefined;
  // user.passwordResetTokenExprire = undefined;
  // await user.save();
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
  // 4) Update password changed at property in pre save documnet hook
  // 5) Generate new token for the user
  return createAndSendToken({ user, statusCode: StatusCodes.OK, message: "Password reset successfully", res });
});

export const updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get current user
  // const user = await User.findById(req.user.id).select("+password");
  const user = await prisma.user.findUnique({ where: { id: req?.user?.id } });
  if (!user) {
    return next(new AppError("No user found", StatusCodes.UNAUTHORIZED));
  }

  // 2) Compare password
  const { newPassword, currentPassword } = req.body;
  const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordCorrect) {
    return next(new AppError("Please enter correct password", StatusCodes.BAD_REQUEST));
  }
  // 3) Update Password
  // user.password = newPassword;
  // user.confirmPassword = confirmPassword;
  // await user.save();
  // user.password = undefined!;
  // user.confirmPassword = undefined!;
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

  // 4) Send token
  return createAndSendToken({ user, statusCode: StatusCodes.OK, message: "Password has been changed!", res });
});

export const confirmEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.params.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    await prisma.user.update({ where: { id: decoded.id }, data: { active: "Active" } });

    return res.status(StatusCodes.OK).json({ status: true, message: "Your email has been verified. Please login again" });
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      const token = jwt.sign({ id: req.params.userId }, process.env.JWT_SECRET as string, {
        expiresIn: "10m",
      });
      const url = `${req.protocol}://${req.get("host")}/api/v1/users/confirm-email/${token}/user/${req.params.userId}`;
      const newUser = await prisma.user.findUnique({ where: { id: Number(req.params.userId) } });

      if (newUser) {
        await new Email({ email: newUser?.email, name: newUser?.name }, url).sendVerificationCode(url);
      }
      return next(new AppError("Tour token has been expired! Please check your email to activate your account.", 401));
    } else if (err.name === "JsonWebTokenError") {
      return next(new AppError("Invalid Token! Please login again.", 401));
    } else {
      return next(new AppError("Invalid Token! Please login again.", 401));
    }
  }
});
