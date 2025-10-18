import { APIFeatures } from "#helpers/apiFeatures.js";
import { AppError } from "#helpers/appError.js";
import { catchAsync } from "#helpers/catchAsync.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Tour } from "./tour.model.js";
import { allowedTourFilters, TourBody, TourQuery } from "./tour.schemas.js";

export const getTours = catchAsync(async (req: Request, res: Response) => {
  const queryData = req.validated?.query as TourQuery;

  const apiFeatures = new APIFeatures(Tour, queryData).filter(allowedTourFilters).limitFields();

  const { data: tours, pagination } = await apiFeatures.paginate();

  // //1.skip the pagination and sorting fileds and get filters
  // const { page, limit, sort, fields, ...filtersObj } = queryData;

  // //2.build filters
  // const filters = buildFilters(filtersObj, allowedTourFilters);

  // //3.build the query object by injecting filters
  // let query = Tour.find(filters);

  // //4. perform sorting if any
  // if (sort) {
  //   const sortBy = sort.replaceAll(",", " ");
  //   query = query.sort(sortBy);
  // }

  // //5. limiting the fields
  // if (fields) {
  //   const limitsByFields = fields.replaceAll(",", " ");
  //   query.select(limitsByFields);
  // } else {
  //   query.select("-__v");
  // }

  // //6. Pagination
  // const { data: tours, pagination } = await paginate(Tour, { query, limit, page, filters });

  return res.status(StatusCodes.OK).json({ status: true, data: { tours, pagination } });
});

export const getTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const tour = await Tour.findById(id);

  if (!tour) {
    return next(new AppError("No tour found with that id", 404));
  }
});

export const createTour = catchAsync(async (req: Request, res: Response) => {
  const newTour: TourBody = req.body;

  const createdTour = await Tour.create(newTour);

  return res.status(201).json({ status: true, data: { tour: createdTour } });
});

export const updateTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const data = req.body;

  const tour = await Tour.findByIdAndUpdate(id, data, { runValidators: true, new: true });
  if (!tour) {
    return next(new AppError("No tour found with that id", StatusCodes.NOT_FOUND));
  }
  return res.status(StatusCodes.OK).json({ status: true, message: "patched", data: { tour } });
});

export const deleteTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const tour = await Tour.findByIdAndDelete(id);

  if (!tour) {
    return next(new AppError("No tour found with that id", StatusCodes.NOT_FOUND));
  }

  return res.status(StatusCodes.OK).json({ status: true, message: "Tour deleted successfully", data: { tour } });
});

export const getTourStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: "$difficulty",
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    { $sort: { avgPrice: -1 } },
  ]);

  return res.status(StatusCodes.OK).json({ status: true, data: { stats } });
});

export const getMonthlyPlan = catchAsync(async (req: Request, res: Response) => {
  const { year } = req.params;

  const stats = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },

    { $addFields: { month: "$_id" } },
    {
      $project: {
        _id: 0,
      },
    },
    { $sort: { numTourStarts: -1 } },
  ]);
  return res.status(StatusCodes.OK).json({ status: true, data: { stats } });
});
