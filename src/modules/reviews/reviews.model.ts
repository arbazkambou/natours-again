import mongoose, { Query } from "mongoose";
import { ReviewType } from "./reviews.schema.js";

const reviewSchema = new mongoose.Schema<ReviewType>(
  {
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (this: Query<any, any>, next) {
  this.populate({ path: "tour", select: "name" }).populate({ path: "user", select: "name photo" });

  next();
});

export const Review = mongoose.model("Review", reviewSchema);
