import { Request, Response } from "express";
import {
  getAttendeesList,
  processUploadAndGeneratePDF,
  updateLogisticsInventory,
} from "./admin.service";
import { updateInventorySchema } from "./admin.schema";

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
