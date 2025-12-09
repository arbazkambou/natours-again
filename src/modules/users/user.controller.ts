import { catchAsync } from "#helpers/catchAsync.js";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { User } from "./user.model.js";

export const updateMe = catchAsync(async (req: Request, res: Response) => {
  // 1) get required field to update
  const { name, email } = req.body;

  const uploadData: any = { name, email };

  if (req.file) {
    uploadData.photo = req.file.filename;
  }

  // 2) update the current user
  await User.findByIdAndUpdate(req.user?._id, uploadData);

  // 3)  Return response
  res.status(StatusCodes.OK).json({ status: true, message: "Data Updated!" });
});

export const deleteMe = catchAsync(async (req: Request, res: Response) => {
  // 1) update the current user
  await User.findByIdAndUpdate(req.user?._id, { active: false });

  // 3)  Return response
  res.status(StatusCodes.NO_CONTENT).json({ status: true, message: "User Deleted!" });
});

const getUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await User.find();

  return res.status(StatusCodes.OK).json({ status: true, data: { users } });
});

function getUser(req: Request, res: Response) {
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false });
}
function createUser(req: Request, res: Response) {
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false });
}
function updateUser(req: Request, res: Response) {
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false });
}
function deleteUser(req: Request, res: Response) {
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false });
}

export { createUser, deleteUser, getUser, getUsers, updateUser };
