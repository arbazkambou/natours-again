export class AppError extends Error {
  statusCode: number;
  status: boolean;
  isOperational: boolean;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = false;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
