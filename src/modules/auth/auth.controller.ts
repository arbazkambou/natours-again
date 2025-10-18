import { AppError } from "#helpers/appError.js";
import { catchAsync } from "#helpers/catchAsync.js";
import { generateJWT } from "#helpers/generateJWT.js";
import { sendEmail } from "#helpers/sendEmail.js";
import { User } from "#modules/users/user.model.js";
import { UserType } from "#modules/users/user.schema.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const signUp = catchAsync(async (req: Request, res: Response) => {
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

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  // 1) Check if user exist
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("No user found with this email", StatusCodes.NOT_FOUND));
  }

  // 2) Create password reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  const tokenExpiredAt = new Date(Date.now() + 10 * 60 * 1000);

  user.passwordResetToken = hashedToken;
  user.passwordResetTokenExprire = tokenExpiredAt;
  await user.save({ validateBeforeSave: false });

  const fullUrl = `${req.protocol}://${req.get("host")}/users`;
  const from = "arbazshoukat@codiea.io";
  const to = user.email;
  const text = `Open this link to reset your password ${fullUrl}/reset-password/${resetToken}`;
  const subject = "Forgot password?";

  try {
    await sendEmail({ from, to, subject, text });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExprire = undefined;
    await user.save({ validateBeforeSave: false });
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
  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetTokenExprire: { $gte: Date.now() } });
  if (!user) {
    return next(new AppError("Token is inavlid or has been expired", StatusCodes.BAD_REQUEST));
  }

  // 3) Update the password
  const { password, confirmPassword } = req.body;
  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExprire = undefined;
  await user.save();

  // 4) Update password changed at property in pre save documnet hook
  // 5) Generate new token for the user
  const newToken = generateJWT(user._id);

  return res.status(StatusCodes.OK).json({ status: true, message: "Password has been changed!", token: newToken });
});

export const updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get current user
  const user = await User.findById(req.user?._id).select("+password");
  if (!user) {
    return next(new AppError("No user found", StatusCodes.UNAUTHORIZED));
  }

  // 2) Compare password
  const { newPassword, confirmPassword, currentPassword } = req.body;
  const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordCorrect) {
    return next(new AppError("Please enter correct password", StatusCodes.BAD_REQUEST));
  }
  // 3) Update Password
  user.password = newPassword;
  user.confirmPassword = confirmPassword;
  await user.save();

  // 4) Send token
  const token = generateJWT(user._id);

  return res.status(StatusCodes.OK).json({ status: true, message: "Your password has been changed", token });
});
