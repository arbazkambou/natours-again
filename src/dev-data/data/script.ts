import { readJsonFile } from "#helpers/helpers.js";
import { Tour } from "#modules/tours/tour.model.js";
import { TourBody } from "#modules/tours/tour.schemas.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

async function deleteData() {
  await Tour.deleteMany();
}

async function saveData(tours: TourBody[]) {
  await Tour.create(tours);
}

export async function importDevData(req: Request, res: Response, next: NextFunction) {
  try {
    const tours: TourBody[] = await readJsonFile("src/dev-data/data/tours-simple.json");
    console.log("tours", tours);

    await deleteData();
    await saveData(tours);

    return res.status(StatusCodes.OK).json({ status: true, message: "Data created successfully" });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Something went wrong", error });
  }
}
