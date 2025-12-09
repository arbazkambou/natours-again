import { Types } from "mongoose";
import z from "zod";

export const reviewSchema = z.object({
  review: z.string().min(1, "Please enter valid review"),
  rating: z.number().min(1, "Enter rating between 1 to 5").max(5, "Enter rating between 1 to 5"),
  createdAt: z.string().optional(),
  tour: z
    .string({ error: "Each review must belong to a tour" })
    .regex(/^[0-9a-fA-F]{24}$/, {
      message: "Invalid Tour Id",
    })
    .optional(),

  user: z
    .string({ error: "Each review must belong to a user" })
    .regex(/^[0-9a-fA-F]{24}$/, {
      message: "Invalid User Id",
    })
    .optional(),
});

export type ReviewType = Omit<z.infer<typeof reviewSchema>, "tour" | "user"> & {
  tour: Types.ObjectId;
  user?: Types.ObjectId;
};

export const reviewCreateSchema = z.object({
  body: reviewSchema,
});
