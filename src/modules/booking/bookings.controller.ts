import { AppError } from "#helpers/appError.js";
import { catchAsync } from "#helpers/catchAsync.js";
import { stripe } from "#helpers/stripe.js";
import { prisma } from "#lib/prisma.js";
import { Tour } from "#modules/tours/tour.model.js";
import { User } from "#modules/users/user.model.js";
import { NextFunction, Request, Response } from "express";
import Stripe from "stripe";
import { Booking } from "./bookings.model.js";

export const createCheckoutSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const tour = await prisma.tour.findUnique({ where: { id: Number(req.params.tourId) } });

  if (!tour) {
    return next(new AppError("No tour found with this id", 401));
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/`,
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
            images: [`${tour.imageCover}`],
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

export const createTourBookingFromSession = async (session: Stripe.Checkout.Session) => {
  const tourId = session.client_reference_id;
  const customerEmail = session.customer_email;
  const price = (session.amount_total ?? 0) / 100;

  if (!tourId || !customerEmail) {
    console.warn("⚠ Missing tourId or customerEmail in session metadata");
    return;
  }

  const user = await User.findOne({ email: customerEmail });
  if (!user) {
    console.warn("⚠ No user found for email:", customerEmail);
    return;
  }

  const tour = await Tour.findById(tourId);
  if (!tour) {
    console.warn("⚠ No tour found for id:", tourId);
    return;
  }

  const existing = await Booking.findOne({
    tour: tourId,
    user: user._id,
    price,
  });

  if (existing) {
    console.log("ℹ Booking already exists, skipping duplicate create");
    return;
  }

  await Booking.create({
    tour: tourId,
    user: user._id,
    price,
    paid: true,
  });
};

export const verifyCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await createTourBookingFromSession(session);
    } catch (err) {
      console.error("❌ Failed to create booking from session:", err);
    }
  }
});
