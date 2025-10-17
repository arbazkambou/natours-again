import { validateInput } from "#middlewares/validate-inputs.js";
import { signIn, signUp } from "#modules/auth/auth.controller.js";
import express from "express";
import { createUser, deleteUser, getUser, getUsers, updateUser } from "./user.controller.js";
import { createUserSchema } from "./user.schema.js";

const userRouter = express.Router();

userRouter.route("/").get(getUsers).post(createUser);
userRouter.route("/sign-up").post(validateInput(createUserSchema), signUp);
userRouter.route("/sign-In").post(signIn);
userRouter.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export { userRouter };
