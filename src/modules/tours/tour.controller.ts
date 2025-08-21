import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Tour, TourBodySchema, tourParamsSchema } from "./tour.schemas.js";
import { formatZodError, readJsonFile, writeToJsonFile } from "#helpers/helpers.js";

const tours = readJsonFile("src/dev-data/data/tours-simple.json") as Tour[];

export function getTours(req: Request, res: Response) {
  return res.status(StatusCodes.OK).json({ status: true, data: { tours } });
}

export function getTour(req: Request, res: Response) {
  const parsed = tourParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({ status: false, errors: formatZodError(parsed.error), message: parsed.error.message });
  }

  const { id } = parsed.data;

  const tour = tours.find((tour) => tour.id === id);

  if (tour) {
    return res.status(StatusCodes.OK).json({ status: true, data: { tour } });
  }

  return res.status(StatusCodes.NOT_FOUND).json({ status: false, message: "No tour found with that id" });
}

export async function createTour(req: Request, res: Response) {
  const parsed = TourBodySchema.safeParse(req.body);
  const { success, error } = parsed;

  if (!success) {
    return res.status(StatusCodes.BAD_REQUEST).json({ status: false, errors: formatZodError(error) });
  }

  const newTour = req.body;
  newTour.id = tours[tours.length - 1].id + 1;
  tours.push(newTour);
  await writeToJsonFile("src/dev-data/data/tours-simple.json", tours);
  res.status(201).json({ status: true, data: { tour: newTour } });
}

export function updateTour(req: Request, res: Response) {
  const { id } = req.params;

  const tour = tours.find((tour) => tour.id === Number(id));

  if (!tour) {
    return res.status(StatusCodes.NOT_FOUND).json({ status: false, message: "No tour found with that id" });
  }

  return res.status(StatusCodes.OK).json({ status: true, message: "patched" });
}

export function deleteTour(req: Request, res: Response) {
  return res.status(StatusCodes.NO_CONTENT).json({ status: false });
}
