import { catchAsync } from "#helpers/catchAsync.js";
import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import sharp from "sharp";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const resizePhoto = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();

  // ensure uploads folder exists
  const uploadFolder = path.join(__dirname, "..", "..", "uploads");
  if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

  // create filename
  const filename = `${req.user?._id}-${Date.now()}.jpeg`;
  const absoluteUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
  req.file.filename = absoluteUrl;

  const uploadPath = path.join(uploadFolder, filename);

  // process image
  await sharp(req.file.buffer).resize(500, 500).toFormat("jpeg").jpeg({ quality: 90 }).toFile(uploadPath);

  next();
});
