import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { getVolunteerLogs } from "./volunteer.service";
import { getVolunteerLogsSchema } from "./volunteer.schema";
import { AppError } from "../../errors/AppError";

export const handleGetVolunteerLogs = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const filters = getVolunteerLogsSchema.parse(req.query);

    if (!req.user) {
      throw new AppError(401, "Unauthorized. Missing user context.");
    }

    const logsData = await getVolunteerLogs(
      req.user.id,
      filters.page,
      filters.limit,
      {
        status: filters.status,
        search: filters.search,
        mealType: filters.mealType,
      },
    );

    res.status(200).json(logsData);
  },
);
