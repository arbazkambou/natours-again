import mongoose, { model, Schema } from "mongoose";

const bookingSchema = new Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
    required: [true, "A booking must have a tour"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A booking must have a user"],
  },

  price: {
    type: Number,
    required: [true, "A booking must have a price"],
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export const Booking = model("Booking", bookingSchema);
