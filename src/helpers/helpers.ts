import { tourParamsSchema } from "#modules/tours/tour.schemas.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import fs from "fs";
import path from "path";
import { promises as asyncFs } from "fs";

export function checkTourID(req: Request, res: Response, next: NextFunction) {
  const parsed = tourParamsSchema.safeParse(req.params);
  const { success, error, data } = parsed;
  if (!success) {
    return res.status(StatusCodes.BAD_REQUEST).json({ status: false, errors: formatZodError(error) });
  }

  if (data.id < 1) {
    return res.status(StatusCodes.NOT_FOUND).json({ status: false });
  }
  next();
}

export function formatZodError<T>(error: ZodError) {
  return error.issues.map((error) => `${error.path}: ${error.message}`);
}

export function readJsonFile(pathFromRoot: string) {
  const fullPath = path.resolve(process.cwd(), pathFromRoot);
  const text = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(text);
}

export async function writeToJsonFile<T>(pathFromRoot: string, data: T): Promise<void> {
  const fullPath = path.resolve(process.cwd(), pathFromRoot);
  const jsonData = JSON.stringify(data, null, 2);
  await asyncFs.writeFile(fullPath, jsonData, "utf-8");
}
