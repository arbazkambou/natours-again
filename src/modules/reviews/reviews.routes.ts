import { protectRoute } from "#middlewares/protectRoutes.js";
import { restrictTo } from "#middlewares/restrictTo.js";
import { validateInput } from "#middlewares/validate-inputs.js";
import express from "express";
import { createReview, deleteReview, getAllReviews, getSingleReview, updateReview } from "./reviews.controller.js";
import { reviewCreateSchema } from "./reviews.schema.js";

export const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.route("/").get(protectRoute, restrictTo("admin"), getAllReviews).post(protectRoute, validateInput(reviewCreateSchema), createReview);

reviewRouter
  .route("/:id")
  .get(protectRoute, restrictTo("user", "admin"), getSingleReview)
  .delete(protectRoute, restrictTo("user", "admin"), deleteReview)
  .patch(protectRoute, restrictTo("user", "admin"), updateReview);
