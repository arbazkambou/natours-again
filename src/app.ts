import { tourRouter } from "#modules/tours/tour.routes.js";
import { userRouter } from "#modules/users/user.routes.js";
import express from "express";
import morgan from "morgan";

const app = express();

//1.Middleware
if (process.env.NODE_ENV === "developement") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.static("public"));

//2.Routes
app.use("/tours", tourRouter);
app.use("/users", userRouter);

export { app };
