import { catchAsync } from "#helpers/catchAsync.js";
import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import sharp from "sharp";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const resizeTourImges = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.files) return next();

  const files = req.files as {
    imageCover?: Express.Multer.File[];
    images?: Express.Multer.File[];
  };

  if (!files.imageCover || !files.images) return next();

  // ensure uploads folder exists
  const uploadFolder = path.join(__dirname, "..", "..", "uploads");
  if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

  // -------------------------
  // PROCESS IMAGE COVER
  // -------------------------
  const imageCoverFile = files.imageCover[0];
  const timestamp = Date.now();

  const imageCoverFileName = `${req.user?._id}-${timestamp}-cover.jpeg`;
  const coverUrl = `${req.protocol}://${req.get("host")}/uploads/${imageCoverFileName}`;

  req.body.imageCover = coverUrl;

  await sharp(imageCoverFile.buffer).resize(2000, 1333).toFormat("jpeg").jpeg({ quality: 90 }).toFile(path.join(uploadFolder, imageCoverFileName));

  // -------------------------
  // PROCESS MULTIPLE IMAGES
  // -------------------------
  req.body.images = []; // IMPORTANT: initialize array

  await Promise.all(
    files.images.map(async (file, i) => {
      const fileName = `${req.user?._id}-${timestamp}-tour-${i + 1}.jpeg`;
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;

      await sharp(file.buffer).resize(2000, 1333).toFormat("jpeg").jpeg({ quality: 90 }).toFile(path.join(uploadFolder, fileName));

      req.body.images.push(fileUrl);
    }),
  );

  next();
});
