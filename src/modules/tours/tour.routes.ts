import { importDevData } from "#dev-data/data/script.js";
import { validateInput } from "#middlewares/validate-inputs.js";
import { protectRoute } from "#modules/auth/auth.controller.js";
import express from "express";
import { createTour, deleteTour, getMonthlyPlan, getTour, getTours, getTourStats, updateTour } from "./tour.controller.js";
import { DeleteTourSchema, GetAllToursSchema, GetSingleTourSchema, TourCreateSchema, TourUpdateSchema } from "./tour.schemas.js";
import { getTop5Tours } from "./tours.middleware.js";

const tourRouter = express.Router();

tourRouter.route("/data").get(importDevData);

tourRouter.route("/").get(protectRoute, validateInput(GetAllToursSchema), getTours).post(validateInput(TourCreateSchema), createTour);
tourRouter.route("/top-5").get(validateInput(GetAllToursSchema), getTop5Tours, getTours);
tourRouter.route("/tour-stats").get(getTourStats);
tourRouter.route("/monthly-plan/:year").get(getMonthlyPlan);

tourRouter
  .route("/:id")
  .get(validateInput(GetSingleTourSchema), getTour)
  .delete(validateInput(DeleteTourSchema), deleteTour)
  .patch(validateInput(TourUpdateSchema), updateTour);

export { tourRouter };
