import { AppError } from "#helpers/appError.js";
import { StatusCodes } from "http-status-codes";
import multer from "multer";

const storage = multer.memoryStorage();

const filter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("Only image files are allowed!", StatusCodes.BAD_REQUEST));
  }
};

const upload = multer({
  storage,
  fileFilter: filter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);
