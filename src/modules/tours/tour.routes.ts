import { importDevData } from "#dev-data/data/script.js";
import { protectRoute } from "#middlewares/protectRoutes.js";
import { resizeTourImges } from "#middlewares/resizeTourImages.js";
import { restrictTo } from "#middlewares/restrictTo.js";
import { uploadTourImages } from "#middlewares/uploadTourImages.js";
import { validateInput } from "#middlewares/validate-inputs.js";
import { reviewRouter } from "#modules/reviews/reviews.routes.js";
import express from "express";
import { createTour, deleteTour, getMonthlyPlan, getTour, getTours, getTourStats, updateTour } from "./tour.controller.js";
import { DeleteTourSchema, GetAllToursSchema, GetSingleTourSchema } from "./tour.schemas.js";
import { getTop5Tours } from "./tours.middleware.js";

const tourRouter = express.Router();

tourRouter.use("/:tourId/review", reviewRouter);

tourRouter.route("/data").get(importDevData);

tourRouter.route("/").get(protectRoute, validateInput(GetAllToursSchema), getTours).post(createTour);
tourRouter.route("/top-5").get(validateInput(GetAllToursSchema), getTop5Tours, getTours);
tourRouter.route("/tour-stats").get(getTourStats);
tourRouter.route("/monthly-plan/:year").get(getMonthlyPlan);

tourRouter
  .route("/:id")
  .get(validateInput(GetSingleTourSchema), getTour)
  .delete(protectRoute, restrictTo("Admin", "Lead_Guide"), validateInput(DeleteTourSchema), deleteTour)
  .patch(protectRoute, restrictTo("Admin", "Lead_Guide"), uploadTourImages, resizeTourImges, updateTour);

export { tourRouter };
