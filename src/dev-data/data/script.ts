import { readJsonFile } from "#helpers/helpers.js";
import { Review } from "#modules/reviews/reviews.model.js";
import { ReviewType } from "#modules/reviews/reviews.schema.js";
import { Tour } from "#modules/tours/tour.model.js";
import { TourBody } from "#modules/tours/tour.schemas.js";
import { User } from "#modules/users/user.model.js";
import { UserType } from "#types/express.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

async function deleteData() {
  await User.deleteMany();
  await Tour.deleteMany();
  await Review.deleteMany();
}

async function saveData(tours: TourBody[]) {
  await Tour.create(tours);
}

export async function importDevData(req: Request, res: Response, next: NextFunction) {
  try {
    const tours: TourBody[] = await readJsonFile("src/dev-data/data/tours.json");
    const reviews: ReviewType[] = await readJsonFile("src/dev-data/data/reviews.json");
    const users: UserType[] = await readJsonFile("src/dev-data/data/users.json");

    await deleteData();
    // await saveData(tours);
    await Tour.create(tours);
    await Review.create(reviews);
    await User.create(users);

    return res.status(StatusCodes.OK).json({ status: true, message: "Data created successfully" });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Something went wrong", error });
  }
}
