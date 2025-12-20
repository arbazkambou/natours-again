import { User } from "@prisma/client";
import { Response } from "express";
import jwt from "jsonwebtoken";

export function createAndSendToken({ user, statusCode, res, message }: { user: User; statusCode: number; res: Response; message: string }) {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
    expiresIn: "90d",
  });

  res.cookie("jwt", token, {
    expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  const { name, email, active, photo, role, id } = user;

  return res.status(statusCode).json({ status: true, token, data: { name, email, active, photo, role, id }, message });
}
