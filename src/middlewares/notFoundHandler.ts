import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  next(
    new AppError(
      404,
      `The route ${req.originalUrl} does not exist on this server.`,
    ),
  );
};
