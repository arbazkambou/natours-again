import { protectRoute } from "#middlewares/protectRoutes.js";
import { restrictTo } from "#middlewares/restrictTo.js";
import express from "express";
import { createReview, deleteReview, getAllReviews, getSingleReview, updateReview } from "./reviews.controller.js";

export const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.route("/").get(protectRoute, restrictTo("Admin"), getAllReviews).post(protectRoute, createReview);

reviewRouter
  .route("/:id")
  .get(protectRoute, restrictTo("User", "Admin"), getSingleReview)
  .delete(protectRoute, restrictTo("User", "Admin"), deleteReview)
  .patch(protectRoute, restrictTo("User", "Admin"), updateReview);
