import { importDevData } from "#dev-data/data/script.js";
import { tourRouter } from "#modules/tours/tour.routes.js";
import { userRouter } from "#modules/users/user.routes.js";
import express from "express";
import morgan from "morgan";
import QueryString from "qs";

const app = express();

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

export { app };
