import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { handleZodError } from "../errors/formatters/handleZodError";
import { handlePrismaError } from "../errors/formatters/handlePrismaError";
import { TErrorSources } from "../types/error.interface";
import { Prisma } from "../../prisma/generated/client";
import { envConfig } from "../shared/config/env";
import { logger } from "../shared/logger";

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next,
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errorSources: TErrorSources = [
    { path: "", message: "Something went wrong" },
  ];

  const isPrismaError =
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientUnknownRequestError ||
    err instanceof Prisma.PrismaClientRustPanicError;

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 503;
    message = "Database Initialization Error";
    errorSources = [
      { path: "", message: "Could not connect to the database." },
    ];
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    message = "Database Unknown Request Error";
    errorSources = [
      { path: "", message: "An unknown database error occurred." },
    ];
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = 500;
    message = "Database Engine Error";
    errorSources = [{ path: "", message: "The database engine crashed." }];
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [{ path: "", message: err.message }];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [{ path: "", message: err.message }];
  }

  if (statusCode >= 500) {
    logger.error({ err }, "Unhandled Error Caught");
  }

  if (envConfig.NODE_ENV === "production" && isPrismaError) {
    message = "Database Error";
    errorSources = [{ path: "", message: "A database operation failed." }];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: envConfig.NODE_ENV === "development" ? err.stack : undefined,
  });
};
