import { Request, Response } from "express";
import { getVolunteerLogs } from "./volunteer.service";
import { getVolunteerLogsSchema } from "./volunteer.schema";
import { ScanStatus } from "../../generated/prisma/enums";

export const handleGetVolunteerLogs = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // 1. Validate the query parameters
    const validatedData = getVolunteerLogsSchema.parse({ query: req.query });
    const { page, limit, status } = validatedData.query;

    // 2. Get the securely authenticated Volunteer's ID
    const volunteerId = req.user!.id;

    // 3. Fetch their personal logs
    const logsData = await getVolunteerLogs(
      volunteerId,
      page,
      limit,
      status as ScanStatus,
    );

    return res.status(200).json(logsData);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Volunteer Logs Error:", error);
    return res.status(500).json({ error: "Failed to fetch volunteer logs." });
  }
};
