import { NextFunction, Request, Response } from "express";
import { TourQuery } from "./tour.schemas.js";

export async function getTop5Tours(req: Request, res: Response, next: NextFunction) {
  const query = req.validated.query as TourQuery;

  query.limit = 5;
  query.sort = "-ratingsAverage,price";

  console.log(req.validated.query);
  next();
}
