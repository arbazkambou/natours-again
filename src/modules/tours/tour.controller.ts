import { AppError } from "#helpers/appError.js";
import { catchAsync } from "#helpers/catchAsync.js";
import { prisma } from "#lib/prisma.js";
import { parse } from "date-fns";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Tour } from "./tour.model.js";
import { allowedTourFilters } from "./tour.schemas.js";

export const getTours = catchAsync(async (req: Request, res: Response) => {
  const queryData = (req as any).validated?.query ?? req.query;

  const { page = 1, limit = 10, sort, fields, ...filtersObj } = queryData;

  // 1) Build Prisma `where` from query like price[gt], duration[gte]
  const where: any = {};
  const opMap: Record<string, string> = {
    eq: "equals",
    gt: "gt",
    gte: "gte",
    lt: "lt",
    lte: "lte",
    ne: "not",
  };

  for (const rawKey of Object.keys(filtersObj)) {
    // rawKey examples: "price", "price[gt]", "duration[gte]"
    const match = rawKey.match(/^(.+?)(\[(.+)\])?$/); // base + [op]
    if (!match) continue;

    const field = match[1]; // e.g. "price"
    const rawOp = match[3]; // e.g. "gt" | "gte" | undefined
    if (!allowedTourFilters.includes(field)) continue;

    const rawValue = filtersObj[rawKey] as string;
    const value = isNaN(Number(rawValue)) ? rawValue : Number(rawValue);

    if (!rawOp) {
      // /tours?price=397  -> where.price.equals = 397
      if (!where[field]) where[field] = {};
      where[field].equals = value;
    } else {
      const op = opMap[rawOp];
      if (!op) continue;

      // support multiple operators for same field: price[gt] & price[lte]
      if (!where[field]) where[field] = {};
      where[field][op] = value;
    }
  }

  // 2) Sorting: /tours?sort=price,-ratingsAverage
  let orderBy: any = undefined;
  if (sort) {
    orderBy = (sort as string)
      .split(",")
      .map((field) => (field.startsWith("-") ? { [field.slice(1)]: "desc" as const } : { [field]: "asc" as const }));
  }

  // 3) Field limiting: /tours?fields=name,price,summary
  let select: any = undefined;
  if (fields) {
    select = {};
    (fields as string).split(",").forEach((f) => {
      select[f] = true;
    });
  }

  // 4) Pagination using skip + take (offset pagination) [web:50][web:69]
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  // 5) Fetch data + total count [web:50][web:57]
  const [tours, totalDocs] = await Promise.all([
    prisma.tour.findMany({
      where,
      orderBy,
      select,
      skip,
      take: limitNum,
    }),
    prisma.tour.count({ where }),
  ]);

  const totalPages = Math.ceil(totalDocs / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPreviousPage = pageNum > 1;

  const pagination = {
    page: pageNum,
    limit: limitNum,
    totalPages,
    totalDocs,
    hasNextPage,
    hasPreviousPage,
    nextPage: hasNextPage ? pageNum + 1 : null,
    previousPage: hasPreviousPage ? pageNum - 1 : null,
  };

  return res.status(StatusCodes.OK).json({ status: true, data: { tours, pagination } });
});

export const getTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  // const tour = await Tour.findById(id).populate("guides").populate("reviews");
  const tour = await prisma.tour.findUnique({
    where: { id: Number(id) },
    include: { guides: true, reviews: true, startDates: true, startLocations: true, tourImages: true },
  });

  if (!tour) {
    return next(new AppError("No tour found with that id", 404));
  }

  return res.status(StatusCodes.OK).json({ status: true, data: tour });
});

export const createTour = catchAsync(async (req: Request, res: Response) => {
  const {
    name,
    duration,
    maxGroupSize,
    difficulty,
    ratingsAverage,
    ratingsQuantity,
    price,
    summary,
    description,
    imageCover,
    startDates,
    locations,
  } = req.body;

  // const createdTour = await Tour.create(newTour);

  const parsedStartDates =
    startDates?.map((s: string) => {
      const date = parse(s, "yyyy-MM-dd,HH:mm", new Date());
      return { date };
    }) ?? [];

  const createdTour = await prisma.tour.create({
    data: {
      name,
      duration,
      maxGroupSize,
      difficulty,
      ratingsAverage,
      ratingsQuantity,
      price,
      summary,
      description,
      imageCover,
      startDates: { create: parsedStartDates },
      startLocations: {
        create:
          locations?.map((loc: any) => ({
            latitude: loc.latitude,
            longitude: loc.longitude,
            address: loc.address,
            description: loc.description,
            day: loc.day,
          })) ?? [],
      },
    },

    include: { startDates: true, startLocations: true },
  });

  return res.status(201).json({ status: true, data: { tour: createdTour } });
});

export const updateTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  console.log("body", req.body);

  // const tour = await Tour.findByIdAndUpdate(id, data, { runValidators: true, new: true });
  const tour = await prisma.tour.update({
    where: { id: Number(id) },
    data: { tourImages: { create: req.body.images.map((url: string) => ({ url })) }, imageCover: req.body.imageCover },
    include: { tourImages: true },
  });
  if (!tour) {
    return next(new AppError("No tour found with that id", StatusCodes.NOT_FOUND));
  }
  return res.status(StatusCodes.OK).json({ status: true, message: "patched", data: { tour } });
});

export const deleteTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  // const tour = await Tour.findByIdAndDelete(id);
  const tour = await prisma.tour.findUnique({ where: { id: Number(id) } });

  if (!tour) {
    return next(new AppError("No tour found with that id", StatusCodes.NOT_FOUND));
  }

  await prisma.tour.delete({ where: { id: Number(id) } });

  return res.status(StatusCodes.OK).json({ status: true, message: "Tour deleted successfully", data: { tour } });
});

export const getTourStats = catchAsync(async (req: Request, res: Response) => {
  const prismaStats = await prisma.tour.groupBy({
    by: "difficulty",
    where: { ratingsAverage: { gte: 4.5 } },
    _count: { _all: true },
    _sum: { ratingsQuantity: true, price: true },
    _avg: { ratingsAverage: true, price: true },
    _min: { price: true },
    _max: { price: true },
    orderBy: { _avg: { price: "desc" } },
  });

  const stats = prismaStats.map((stat) => ({
    difficulty: stat.difficulty,
    numTours: stat._count._all,
    numRatings: stat._sum.ratingsQuantity,
    avgPrice: stat._avg.price,
    avgRating: stat._avg.ratingsAverage,
    minPrice: stat._min.price,
    maxPrice: stat._max.price,
  }));

  // const stats = await Tour.aggregate([
  //   {
  //     $match: {
  //       ratingsAverage: { $gte: 4.5 },
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: "$difficulty",
  //       numTours: { $sum: 1 },
  //       numRatings: { $sum: "$ratingsQuantity" },
  //       avgRating: { $avg: "$ratingsAverage" },
  //       avgPrice: { $avg: "$price" },
  //       minPrice: { $min: "$price" },
  //       maxPrice: { $max: "$price" },
  //     },
  //   },
  //   { $sort: { avgPrice: -1 } },
  // ]);

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

export const updateTourRating = async (tourId: number) => {
  const stats = await prisma.review.groupBy({
    by: "tourId",
    where: { tourId: Number(tourId) },
    _count: { _all: true },
    _avg: { rating: true },
  });
  // const stats = await Review.aggregate([
  //   {
  //     $match: {
  //       tour: new mongoose.Types.ObjectId(tourId),
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: "$tour",
  //       nRating: { $sum: 1 },
  //       avgRating: { $avg: "$rating" },
  //     },
  //   },
  // ]);

  if (stats.length > 0) {
    //  await Tour.findByIdAndUpdate(tourId, {
    //   ratingsQuantity: stats[0]._count._all,
    //   ratingsAverage: stats[0]._avg.rating,
    // });
    await prisma.tour.update({
      where: { id: Number(tourId) },
      data: { ratingsQuantity: stats[0]._count._all ?? 0, ratingsAverage: stats[0]._avg.rating ?? 4.5 },
    });
  } else {
    // await Tour.findByIdAndUpdate(tourId, {
    //   ratingsQuantity: 0,
    //   ratingsAverage: 4.5,
    // });

    await prisma.tour.update({
      where: { id: Number(tourId) },
      data: { ratingsQuantity: 0, ratingsAverage: 4.5 },
    });
  }
};
