import { Request, Response } from "express";
import {
  getAttendeesList,
  getSystemLogs,
  processManualOverride,
  processUploadAndGeneratePDF,
  updateLogisticsInventory,
} from "./admin.service";
import {
  getAttendeesQuerySchema,
  getLogsQuerySchema,
  overrideSchema,
  updateInventorySchema,
} from "./admin.schema";

export const handleCsvUpload = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No CSV file uploaded." });
    }

    const base64Pdf = await processUploadAndGeneratePDF(req.file.buffer);
    return res.json({ pdfBase64: base64Pdf });
  } catch (error: any) {
    // 1. Keep the log clean so your terminal doesn't look like it crashed
    console.warn("Upload Notice:", error.message);

    if (!res.headersSent) {
      // 💥 2. GRACEFUL ERROR HANDLING
      if (
        error.message ===
        "No new attendees to add. All emails in this CSV already exist."
      ) {
        // 409 Conflict is the perfect HTTP status for "Data already exists"
        return res.status(409).json({
          error: "Duplicate File",
          message:
            "All attendees in this CSV are already in the system. No duplicate tickets were created.",
        });
      }

      // 3. Fallback for actual server crashes
      return res
        .status(500)
        .json({ error: "Failed to process CSV and generate PDF." });
    }
  }
};

export const handleUpdateInventory = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // 1. Validate the incoming body
    const validatedData = updateInventorySchema.parse({ body: req.body });
    const { totalAvailable } = validatedData.body;

    // 2. Pass to the service layer
    const updatedInventory = await updateLogisticsInventory(totalAvailable);

    // 3. Return the success response
    return res.status(200).json({
      message: "Inventory updated successfully.",
      inventory: updatedInventory,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Inventory Update Error:", error);
    return res.status(500).json({ error: "Failed to update inventory." });
  }
};

export const handleGetAttendees = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // 1. Validate and extract query parameters
    const validatedData = getAttendeesQuerySchema.parse({ query: req.query });

    // 💥 NEW: Extract the status
    const { search, page, limit, status } = validatedData.query;

    // 2. Pass parameters to the service (including status)
    const result = await getAttendeesList(search, page, limit, status);

    // 3. Return the paginated response
    return res.status(200).json(result);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Fetch Attendees Error:", error);
    return res.status(500).json({ error: "Failed to fetch attendees list." });
  }
};
export const handleManualOverride = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // 1. Validate the input
    const validatedData = overrideSchema.parse({ body: req.body });
    const { attendeeId } = validatedData.body;

    // 2. Get the Admin's ID from the auth token
    const adminId = req.user!.id;

    // 3. Process the override
    const result = await processManualOverride(attendeeId, adminId);

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({
      message: "Manual override successful. Food marked as claimed.",
      attendee: result.attendee,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Manual Override Error:", error);
    return res
      .status(500)
      .json({ error: "Failed to process manual override." });
  }
};

export const handleGetLogs = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // 1. Validate and extract the query parameters
    const validatedData = getLogsQuerySchema.parse({ query: req.query });
    const { page, limit } = validatedData.query;

    // 2. Fetch the logs
    const logsData = await getSystemLogs(page, limit);

    // 3. Return the paginated response
    return res.status(200).json(logsData);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Fetch Logs Error:", error);
    return res.status(500).json({ error: "Failed to fetch system logs." });
  }
};
