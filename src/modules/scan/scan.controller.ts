import { Request, Response } from "express";
import { processScan } from "./scan.service";
import { scanRequestSchema } from "./scan.schema";
import { catchAsync } from "../../shared/catchAsync";
import { AppError } from "../../errors/AppError";

export const handleScan = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { qrToken } = scanRequestSchema.parse(req.body);

    if (!req.user) {
      throw new AppError(401, "Unauthorized. Missing user context.");
    }

    const volunteerId = req.user.id;
    const result = await processScan(qrToken, volunteerId);

    let statusCode = 200;
    if (result.status === "INVALID") statusCode = 404;
    else if (result.status === "DUPLICATE") statusCode = 409;
    else if (result.status === "DEPLETED") statusCode = 400;

    res.status(statusCode).json(result);
  },
);
