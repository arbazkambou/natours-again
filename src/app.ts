import { AppError } from "#helpers/appError.js";
import { globalErrorHandler } from "#helpers/globalErrorHandler.js";
import { sanitizeUserInputs } from "#middlewares/sanitizeUserInputs.js";
import { reviewRouter } from "#modules/reviews/reviews.routes.js";
import { tourRouter } from "#modules/tours/tour.routes.js";
import { userRouter } from "#modules/users/user.routes.js";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import { StatusCodes } from "http-status-codes";
import morgan from "morgan";
import path from "path";

const app = express();
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Too many requests, please try again later!",
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

//1.Middleware
if (process.env.NODE_ENV === "developement") {
  app.use(morgan("dev"));
}

app.set("trust proxy", 1);

const API_PREFIX = process.env.API_PREFIX!;

app.use(express.json({ limit: "10kb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(express.static("public"));

// Security headers
app.use(helmet());

// Sanitize request data
// app.use(mongoSanitize());

// Sanitize user inputs
app.use(sanitizeUserInputs);

// Prevent HTTP Parameter Pollution
app.use(
  hpp({
    whitelist: ["duration", "price", "ratingsAverage"], // optional
  }),
);

//2.Routes
app.use(`${API_PREFIX}`, apiLimiter);
app.use(`${API_PREFIX}/tours`, tourRouter);
app.use(`${API_PREFIX}/users`, userRouter);
app.use(`${API_PREFIX}/review`, reviewRouter);

//Unhandled Routes
app.use(function (req, res, next) {
  return next(new AppError(`Requested ${req.originalUrl} not found on this server!`, StatusCodes.NOT_FOUND));
});

app.use(globalErrorHandler);

export { app };
