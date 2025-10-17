import { Document, model, Schema } from "mongoose";
import { TourBody } from "./tour.schemas.js";
import slugify from "slugify";

export const tourSchema = new Schema<TourBody>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: String,

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
  },
  {
    toJSON: { virtuals: true },
  },
);

tourSchema.virtual("durationInWeeks").get(function () {
  return (this.duration / 7).toFixed(1);
});

tourSchema.pre("save", function (next) {
  this.slug = slugify.default(this.name, { lower: true });
  next();
});

export const Tour = model("Tour", tourSchema);
