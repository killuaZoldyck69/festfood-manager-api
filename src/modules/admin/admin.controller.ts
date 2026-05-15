import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AppError } from "../../errors/AppError";
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

export const handleCsvUpload = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError(400, "No CSV file uploaded.");
    }

    const base64Pdf = await processUploadAndGeneratePDF(req.file.buffer);
    res.json({ pdfBase64: base64Pdf });
  },
);

export const handleUpdateInventory = catchAsync(
  async (req: Request, res: Response) => {
    const { totalAvailable } = updateInventorySchema.parse({
      body: req.body,
    }).body;
    const updatedInventory = await updateLogisticsInventory(totalAvailable);

    res.status(200).json({
      message: "Inventory updated successfully.",
      inventory: updatedInventory,
    });
  },
);

export const handleGetAttendees = catchAsync(
  async (req: Request, res: Response) => {
    const { search, page, limit, status } = getAttendeesQuerySchema.parse({
      query: req.query,
    }).query;
    const result = await getAttendeesList(search, page, limit, status);

    res.status(200).json(result);
  },
);

export const handleManualOverride = catchAsync(
  async (req: Request, res: Response) => {
    const { attendeeId } = overrideSchema.parse({ body: req.body }).body;
    const adminId = req.user!.id;
    const result = await processManualOverride(attendeeId, adminId);

    res.status(200).json({
      message: "Manual override successful. Food marked as claimed.",
      attendee: result,
    });
  },
);

export const handleGetLogs = catchAsync(async (req: Request, res: Response) => {
  const { page, limit } = getLogsQuerySchema.parse({ query: req.query }).query;
  const logsData = await getSystemLogs(page, limit);

  res.status(200).json(logsData);
});
