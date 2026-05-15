import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  next(
    new AppError(
      404,
      `The route ${req.originalUrl} does not exist on this server.`,
    ),
  );
};
