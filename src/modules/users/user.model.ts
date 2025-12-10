import bcrypt from "bcryptjs";
import { model, Query, Schema } from "mongoose";
import { UserType } from "./user.schema.js";

export const userSchema = new Schema<UserType>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    // unique: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "lead-guide", "guide"],
    default: "user",
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  confirmPassword: {
    type: String,
    // required: true,
    select: false,
  },
  photo: {
    type: String,
    required: true,
  },
  passwordChangedAt: {
    type: Date,
  },

  passwordResetToken: {
    type: String,
  },

  passwordResetTokenExprire: {
    type: Date,
  },

  active: {
    type: Boolean,
    default: false,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }
  this.passwordChangedAt = String(Date.now() - 1000);
  next();
});

// userSchema.pre(/^find/, function (this: Query<any, any>, next) {
//   this.find({ active: { $ne: false } });
//   next();
// });

export const User = model("User", userSchema);
