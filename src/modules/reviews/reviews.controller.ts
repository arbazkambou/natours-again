import { catchAsync } from "#helpers/catchAsync.js";
import { prisma } from "#lib/prisma.js";
import { updateTourRating } from "#modules/tours/tour.controller.js";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ReviewType } from "./reviews.schema.js";

export const createReview = catchAsync(async (req: Request, res: Response) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user?.id;

  const { tour, user, rating, review } = req.body;

  const isAlreadyReviewed = await prisma.review.findFirst({ where: { tourId: Number(tour), userId: Number(user) } });

  // const isAlreadyReviewed = await Review.find({ tour: req.body.tour, user: req.body.user });

  if (isAlreadyReviewed) {
    return res.status(StatusCodes.BAD_REQUEST).json({ status: false, message: "Review already created!" });
  }

  const createdReview = await prisma.review.create({ data: { tourId: Number(tour), userId: Number(user), review, rating } });

  await updateTourRating(createdReview.tourId);

  return res.status(StatusCodes.CREATED).json({ status: true, data: createdReview });
});

export const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  let where = {};

  if (req.params.tourId) where = { tourId: Number(req.params.tourId) };
  // let filter = {};

  // if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await prisma.review.findMany({ where });
  return res.status(StatusCodes.OK).json({ status: true, data: reviews });
});

export const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });

  if (!review) {
    return res.status(StatusCodes.BAD_REQUEST).json({ status: true, message: "No Review Found With That Id" });
  }

  await prisma.review.delete({ where: { id: req.params.id } });

  await updateTourRating(review.tourId);

  return res.status(StatusCodes.NO_CONTENT).json({ status: true, message: "Review Deleted" });
});

export const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { review, rating } = req.body as ReviewType;

  // const updateReview = await Review.findByIdAndUpdate(id, { review, rating });

  const reviewToUpdate = await prisma.review.findUnique({ where: { id } });

  if (!reviewToUpdate) {
    return res.status(StatusCodes.BAD_REQUEST).json({ status: true, message: "No Review Found With That Id" });
  }

  const updateReview = await prisma.review.update({ where: { id }, data: { review, rating } });

  await updateTourRating(updateReview.tourId);

  return res.status(StatusCodes.OK).json({ status: true, message: "Review Updated" });
});

export const getSingleReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const review = await prisma.review.findUnique({ where: { id } });

  return res.status(StatusCodes.OK).json({ status: true, data: review });
});
