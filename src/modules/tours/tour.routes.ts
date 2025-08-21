import { checkTourID } from "#helpers/helpers.js";
import express from "express";
import { createTour, deleteTour, getTour, getTours, updateTour } from "./tour.controller.js";
import { TourSchema } from "./tour.schemas.js";
import { validateInput } from "#middlewares/validate-inputs.js";

const tourRouter = express.Router();

tourRouter.param("id", checkTourID);
tourRouter
  .route("/")
  .get(getTours)
  .post(validateInput(TourSchema.omit({ params: true })), createTour);
tourRouter.route("/:id").get(getTour).delete(deleteTour).patch(updateTour);

export { tourRouter };
