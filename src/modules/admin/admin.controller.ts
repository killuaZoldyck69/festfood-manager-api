import { Request, Response } from "express";
import {
  getAttendeesList,
  getSystemLogs,
  processManualOverride,
  processUploadAndGeneratePDF,
  updateLogisticsInventory,
} from "./admin.service";
import {
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

    // 🔴 Await the Base64 string and send it as standard JSON!
    const base64Pdf = await processUploadAndGeneratePDF(req.file.buffer);
    return res.json({ pdfBase64: base64Pdf });
  } catch (error) {
    console.error("Upload Error:", error);
    if (!res.headersSent) {
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
    // Extract the query parameter (e.g., /api/admin/attendees?search=John)
    const search = req.query.search as string | undefined;

    // Pass it to the service
    const attendees = await getAttendeesList(search);

    // Return the array of students
    return res.status(200).json({
      count: attendees.length,
      attendees: attendees,
    });
  } catch (error) {
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
