import bcrypt from "bcryptjs";
import { model, Schema } from "mongoose";
import { UserType } from "./user.schema.js";

export const userSchema = new Schema<UserType>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: true,
    select: false,
  },
  photo: {
    type: String,
    required: true,
  },
  passwordChangedAt: {
    type: Date,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

export const User = model("User", userSchema);
