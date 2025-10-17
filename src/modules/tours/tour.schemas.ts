import { z } from "zod";

////////////////////// Base Schemas/////////////////////////////
export const TourBodySchema = z.object({
  name: z.string().min(3, "Tour name must have 3 characters."),
  duration: z.number({ error: "Tour must have a duration." }).positive().gt(0, { error: "Duration must be greater than 0." }),
  maxGroupSize: z.number({ error: "Tour must have maximum group size." }).positive().gt(0),
  difficulty: z.enum(["easy", "medium", "difficult"], { error: "Tour must have difficulty easy, medium or difficult." }),
  ratingsAverage: z.number().min(1).max(5).default(4.5).optional(),
  ratingsQuantity: z.number().int().nonnegative().default(0).optional(),
  price: z.number({ error: "A tour must have a price." }).positive({ error: "Tour Price must be positive." }),
  priceDiscount: z.number({ error: "Tour price must be a number." }).positive({ error: "Tour Price must be positive value" }).optional(),
  summary: z.string().min(1, "Tour must have a summary.").trim().optional(),
  description: z.string().trim().optional(),
  imageCover: z.string().min(1, "Tour must have an image.").optional(),
  images: z.array(z.string()).min(3, "Tour must have 3 images other than image cover"),
  startDates: z.array(z.string()).min(1, "Tour must have a start date"),
  createdAt: z.string().optional(),
  slug: z.string().optional(),
});

export const TourParamsSchema = z.object({
  id: z.string(),
});

const numberFilter = z.union([
  z.coerce.number(),
  z.object({
    gt: z.coerce.number().optional(),
    gte: z.coerce.number().optional(),
    lt: z.coerce.number().optional(),
    lte: z.coerce.number().optional(),
  }),
]);

export const TourQuerySchema = z.object({
  //search query
  duration: numberFilter.optional(),
  price: numberFilter.optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),

  //pagination
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),

  // sort: z.string().optional(),
  sort: z.string().optional(),

  //limiting fields,
  fields: z.string().optional(),
});

/////////////////////////Route specific schemas//////////////////////////////
export const TourCreateSchema = z.object({
  body: TourBodySchema,
});

export const TourUpdateSchema = z.object({
  body: TourBodySchema.partial(),
  params: TourParamsSchema,
});

export const GetAllToursSchema = z.object({
  query: TourQuerySchema,
});

export const GetSingleTourSchema = z.object({
  params: TourParamsSchema,
});

export const DeleteTourSchema = z.object({
  params: TourParamsSchema,
});

/////////////////////////// Base Types/////////////////////////////////////
export type TourBody = z.infer<typeof TourBodySchema>;
export type TourParams = z.infer<typeof TourParamsSchema>;
export type TourQuery = z.infer<typeof TourQuerySchema>;

////////////////////////Alloed Filters///////////////////////////////
export const allowedTourFilters = Object.keys(TourQuerySchema.shape);
