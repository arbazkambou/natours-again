import { AppError } from "#helpers/appError.js";
import { catchAsync } from "#helpers/catchAsync.js";
import { stripe } from "#helpers/stripe.js";
import { Tour } from "#modules/tours/tour.model.js";
import { NextFunction, Request, Response } from "express";
import { Booking } from "./bookings.model.js";

export const createCheckoutSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(new AppError("No tour found with this id", 401));
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/api/v1/bookings/create-booking/?tour=${tour.id}&user=${req.user?._id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get("host")}/`,
    customer_email: req.user?.email,
    client_reference_id: req.params.tourId,
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });

  return res.status(200).json({ status: true, data: session.url });
});

export const createBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) {
    return next(new AppError("Please fill all the data required for a booking", 401));
  }

  const booking = await Booking.create({ tour, user, price });

  return res.status(200).json({ status: true, data: booking });
});
