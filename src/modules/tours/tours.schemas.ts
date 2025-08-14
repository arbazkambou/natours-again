// src/modules/tours/tour.schema.ts
import { z } from "zod";

export const TourSchema = z.object({
  name: z.string().min(3),
  duration: z.number().positive(),
  maxGroupSize: z.number().positive(),
  difficulty: z.enum(["easy", "medium", "difficult"]),
  ratingsAverage: z.number().min(1).max(5).default(4.5),
  ratingsQuantity: z.number().int().nonnegative().default(0),
  price: z.number().positive(),
  summary: z.string().min(10),
  description: z.string(),
  imageCover: z.string(),
  images: z.array(z.string()),
  startDates: z.array(z.string()), // could refine date format if needed
});

export type Tour = z.infer<typeof TourSchema> & { id: number };
