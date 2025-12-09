import { validateInput } from "#middlewares/validate-inputs.js";
import { forgotPassword, resetPassword, signIn, signUp, updatePassword } from "#modules/auth/auth.controller.js";
import express from "express";
import { createUser, deleteMe, deleteUser, getUser, getUsers, updateMe, updateUser } from "./user.controller.js";
import { createUserSchema, forgotPasswordSchema, resetPasswordSchema, updateMeSchema, updatePasswordSchema } from "./user.schema.js";
import { protectRoute } from "#middlewares/protectRoutes.js";
import { restrictTo } from "#middlewares/restrictTo.js";
import { uploadPhoto } from "#middlewares/uploadPhoto.js";
import { resizePhoto } from "#middlewares/resizePhoto.js";

const userRouter = express.Router();

userRouter.route("/").get(protectRoute, restrictTo("admin"), getUsers).post(createUser);
userRouter.route("/sign-up").post(validateInput(createUserSchema), signUp);
userRouter.route("/sign-In").post(signIn);
userRouter.route("/forgot-password").post(validateInput(forgotPasswordSchema), forgotPassword);
userRouter.route("/reset-password/:token").post(validateInput(resetPasswordSchema), resetPassword);
userRouter.route("/update-password").post(protectRoute, validateInput(updatePasswordSchema), updatePassword);
userRouter.route("/update-me").patch(protectRoute, uploadPhoto, resizePhoto, updateMe);
userRouter.route("/delete-me").delete(protectRoute, deleteMe);
userRouter.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export { userRouter };
