import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { ApiError } from "@/utils/http";

const GENERIC_500 = "An unexpected error occurred. Please try again.";

const prismaErrorMessage = (err: Prisma.PrismaClientKnownRequestError): { statusCode: number; message: string } => {
  switch (err.code) {
    case "P2002":
      return { statusCode: 409, message: "A record with that value already exists." };
    case "P2003":
      return {
        statusCode: 409,
        message: "This record is in use by other records and cannot be changed or deleted.",
      };
    case "P2025":
      return { statusCode: 404, message: "The requested record was not found." };
    case "P2014":
      return { statusCode: 400, message: "The requested change would break a required relationship." };
    case "P2000":
      return { statusCode: 400, message: "The provided value is too long for the field." };
    case "P2023":
      return { statusCode: 400, message: "The provided id is not valid." };
    default:
      return { statusCode: 500, message: GENERIC_500 };
  }
};

const isDatabaseUnavailable = (err: unknown): boolean =>
  err instanceof Prisma.PrismaClientInitializationError ||
  err instanceof Prisma.PrismaClientRustPanicError ||
  (err instanceof Prisma.PrismaClientKnownRequestError &&
    ["P1001", "P1002", "P1003", "P1017"].includes(err.code));

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const requestId = req.header("x-request-id") ?? "unknown";

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    const message = err.issues[0]?.message ?? "Invalid input";
    res.status(400).json({
      success: false,
      error: {
        message,
        details: err.issues,
      },
    });
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      error: { message: "The request body contains invalid JSON." },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = prismaErrorMessage(err);
    if (mapped.statusCode >= 500) {
      console.error(`[${requestId}] prisma error ${err.code}:`, err.message);
    }
    res.status(mapped.statusCode).json({
      success: false,
      error: { message: mapped.message },
    });
    return;
  }

  if (isDatabaseUnavailable(err)) {
    console.error(`[${requestId}] database unavailable:`, err);
    res.status(503).json({
      success: false,
      error: {
        message: "The database service is temporarily unavailable. Please try again in a moment.",
      },
    });
    return;
  }

  console.error(`[${requestId}] unhandled error:`, err);
  res.status(500).json({
    success: false,
    error: { message: GENERIC_500 },
  });
};
