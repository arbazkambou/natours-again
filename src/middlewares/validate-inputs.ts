import { NextFunction, Response, Request } from "express";
import z from "zod";
import { formatZodError } from "../helpers/helpers.js";

declare module "express-serve-static-core" {
  interface Request {
    validated: {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };
  }
}

type MiddlewareFunction = (req: Request, res: Response, next: NextFunction) => void;

type ValidateInput = (
  schema: z.ZodObject<{
    body?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    params?: z.ZodTypeAny;
  }>,
) => MiddlewareFunction;

export const validateInput: ValidateInput =
  (schema): MiddlewareFunction =>
  (req, res, next) => {
    // Validate the input
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // If the validation fails, return a 400 status with the validation errors
    if (!result.success) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: formatZodError(result.error),
      });
    }

    req.validated = result.data;
    // Call the next middleware or route handler
    next();
  };
