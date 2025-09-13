import { Document, model, Schema } from "mongoose";
import { TourBody } from "./tour.schemas.js";

export const tourSchema = new Schema<TourBody>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  duration: {
    type: Number,
    required: true,
  },

  maxGroupSize: {
    type: Number,
    required: true,
  },

  difficulty: {
    type: String,
    required: true,
  },

  ratingsAverage: {
    type: Number,
    required: true,
  },

  ratingsQuantity: {
    type: Number,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  priceDiscount: {
    type: Number,
  },

  summary: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
  },

  imageCover: {
    type: String,
    required: true,
  },

  images: {
    type: [String],
    required: true,
  },

  startDates: {
    type: [Date],
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

export const Tour = model("Tour", tourSchema);
