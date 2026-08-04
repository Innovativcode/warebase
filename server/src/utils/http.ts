import type { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const asyncHandler =
  <T extends Request, U extends Response>(fn: (req: T, res: U, next: NextFunction) => Promise<unknown>) =>
  (req: T, res: U, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export const notFound = (_req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, "Route not found"));
};

