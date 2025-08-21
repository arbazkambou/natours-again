import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";

function getUsers(req: Request, res: Response) {
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false });
}

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

export { getUser, getUsers, createUser, updateUser, deleteUser };
