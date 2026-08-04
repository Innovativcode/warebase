import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = req.header("x-request-id") ?? randomUUID();
  req.headers["x-request-id"] = id;
  res.setHeader("x-request-id", id);
  next();
};

