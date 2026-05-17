import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { getVolunteerLogs } from "./volunteer.service";
import { getVolunteerLogsSchema } from "./volunteer.schema";
import { ScanStatus } from "../../generated/prisma/client";

export const handleGetVolunteerLogs = catchAsync(
  async (req: Request, res: Response) => {
    const { page, limit, status } = getVolunteerLogsSchema.parse({
      query: req.query,
    }).query;
    const volunteerId = req.user!.id;

    const logsData = await getVolunteerLogs(
      volunteerId,
      page,
      limit,
      status as ScanStatus,
    );

    res.status(200).json(logsData);
  },
);
