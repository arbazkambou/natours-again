import { AppError } from "#helpers/appError.js";
import { globalErrorHandler } from "#helpers/globalErrorHandler.js";
import { tourRouter } from "#modules/tours/tour.routes.js";
import { userRouter } from "#modules/users/user.routes.js";
import express from "express";
import { StatusCodes } from "http-status-codes";
import morgan from "morgan";
import QueryString from "qs";

const app = express();

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

//1.Middleware
if (process.env.NODE_ENV === "developement") {
  app.use(morgan("dev"));
}

app.set("query parser", (str: string) => QueryString.parse(str));

app.use(express.json());
app.use(express.static("public"));

//2.Routes
app.use("/tours", tourRouter);
app.use("/users", userRouter);

//Unhandled Routes
app.use(function (req, res, next) {
  return next(new AppError(`Requested ${req.originalUrl} not found on this server!`, StatusCodes.NOT_FOUND));
});

app.use(globalErrorHandler);

export { app };
