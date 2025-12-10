import { protectRoute } from "#middlewares/protectRoutes.js";
import express from "express";
import { createBooking, createCheckoutSession } from "./bookings.controller.js";

const bookingRouter = express.Router();

bookingRouter.route("/checkout-session/:tourId").get(protectRoute, createCheckoutSession);

bookingRouter.route("/create-booking").get(createBooking);

export { bookingRouter };
