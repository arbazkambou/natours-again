import { catchAsync } from "#helpers/catchAsync.js";
import { updateTourRating } from "#modules/tours/tour.controller.js";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Review } from "./reviews.model.js";
import { ReviewType } from "./reviews.schema.js";

export const createReview = catchAsync(async (req: Request, res: Response) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user?._id;

  const body = req.body as ReviewType;

  const isAlreadyReviewed = await Review.find({ tour: req.body.tour, user: req.body.user });

  if (isAlreadyReviewed) {
    return res.status(StatusCodes.BAD_REQUEST).json({ status: false, message: "Review already created!" });
  }

  const review = await Review.create({ ...body });

  await updateTourRating(review.tour.toString());

  return res.status(StatusCodes.CREATED).json({ status: true, data: review });
});

export const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  let filter = {};

  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  return res.status(StatusCodes.OK).json({ status: true, data: reviews });
});

export const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(StatusCodes.BAD_REQUEST).json({ status: true, message: "No Review Found With That Id" });
  }

  await Review.findByIdAndDelete(req.params.id);

  await updateTourRating(review.tour.toString());

  return res.status(StatusCodes.NO_CONTENT).json({ status: true, message: "Review Deleted" });
});

export const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { review, rating } = req.body as ReviewType;

  const updateReview = await Review.findByIdAndUpdate(id, { review, rating });

  if (!updateReview) {
    return res.status(StatusCodes.BAD_REQUEST).json({ status: true, message: "No Review Found With That Id" });
  }

  await updateTourRating(updateReview.tour.toString());

  return res.status(StatusCodes.OK).json({ status: true, message: "Review Updated" });
});

export const getSingleReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const review = await Review.findById(id);

  return res.status(StatusCodes.OK).json({ status: true, data: review });
});
