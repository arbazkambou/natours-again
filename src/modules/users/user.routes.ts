import express from "express";
import { createUser, deleteUser, getUser, getUsers, updateUser } from "./user.controller.js";

const userRouter = express.Router();

userRouter.route("/").get(getUsers).post(createUser);
userRouter.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export { userRouter };
