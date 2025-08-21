import express from "express";
import { createTour, deleteTour, getTour, getTours, updateTour } from "./tour.controller.js";

const tourRouter = express.Router();

tourRouter.route("/").get(getTours).post(createTour);
tourRouter.route("/:id").get(getTour).delete(deleteTour).patch(updateTour);

export { tourRouter };
