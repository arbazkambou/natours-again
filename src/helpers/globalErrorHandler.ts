// middleware/globalErrorHandler.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "./appError.js";
import { StatusCodes } from "http-status-codes";

const handleCastErrorDB = (err: any) => new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateFieldsDB = (err: any) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)?.[0];
  return new AppError(`Duplicate field value: ${value}. Use another value!`, 400);
};

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  return new AppError(`Invalid input data: ${errors.join(". ")}`, 400);
};

const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err: any, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error
    console.error("💥 ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

const handleInvalidJWT = () => new AppError("Invalid token! Please login.", StatusCodes.UNAUTHORIZED);
const handeExpiredJWT = () => new AppError("Token Expired! Please login agin.", StatusCodes.UNAUTHORIZED);

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || false;

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, message: err.message };

    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleInvalidJWT();
    if (err.name === "TokenExpiredError") error = handeExpiredJWT();

    sendErrorProd(error, res);
  }
};
