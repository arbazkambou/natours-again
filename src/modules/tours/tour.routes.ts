import { importDevData } from "#dev-data/data/script.js";
import { validateInput } from "#middlewares/validate-inputs.js";
import express from "express";
import { createTour, deleteTour, getTour, getTours, updateTour } from "./tour.controller.js";
import { DeleteTourSchema, GetAllToursSchema, GetSingleTourSchema, TourCreateSchema, TourQuerySchema, TourUpdateSchema } from "./tour.schemas.js";
import { getTop5Tours } from "./tours.middleware.js";

const tourRouter = express.Router();

tourRouter.route("/data").get(importDevData);

tourRouter.route("/").get(validateInput(GetAllToursSchema), getTours).post(validateInput(TourCreateSchema), createTour);
tourRouter.route("/top-5").get(validateInput(GetAllToursSchema), getTop5Tours, getTours);

tourRouter
  .route("/:id")
  .get(validateInput(GetSingleTourSchema), getTour)
  .delete(validateInput(DeleteTourSchema), deleteTour)
  .patch(validateInput(TourUpdateSchema), updateTour);

export { tourRouter };
