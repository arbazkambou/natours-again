import { UserType } from "#types/express.js";
import jwt from "jsonwebtoken";
import { Response } from "express";

export function createAndSendToken({ user, statusCode, res, message }: { user: UserType; statusCode: number; res: Response; message: string }) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "90d",
  });

  res.cookie("jwt", token, {
    expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  return res.status(statusCode).json({ status: true, token, data: { user }, message });
}
