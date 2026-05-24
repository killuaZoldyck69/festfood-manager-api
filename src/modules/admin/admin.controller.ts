import fs from "fs";
import os from "os";
import path from "path";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AppError } from "../../errors/AppError";
import {
  getAttendeesList,
  getSystemLogs,
  prepareAllTicketsBackup,
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
    if (!req.file) throw new AppError(400, "No CSV file uploaded.");

    // Now returns the count and filename
    const result = await processUploadAndGeneratePDF(req.file.buffer);
    res.status(200).json(result);
  },
);

export const downloadTempPdf = catchAsync(
  async (req: Request, res: Response) => {
    const filename = req.params.filename as string;
    const filePath = path.join(os.tmpdir(), filename);

    if (!fs.existsSync(filePath)) {
      throw new AppError(
        404,
        "File expired or not found. Please upload again.",
      );
    }

    const stat = fs.statSync(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);

    // 🛡️ Bulletproof cleanup: Triggers on complete success AND sudden disconnects
    res.on("finish", () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    res.on("close", () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });
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
  const { page, limit, status } = getLogsQuerySchema.parse({
    query: req.query,
  }).query;
  const logsData = await getSystemLogs(page, limit, status);

  res.status(200).json(logsData);
});

export const downloadAllTickets = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // 1. Call the service to handle the DB and PDF generation
    const tempFilePath = await prepareAllTicketsBackup();

    // 2. Prepare headers for the frontend download stream
    const stat = fs.statSync(tempFilePath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", stat.size);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="All_Fest_Tickets_Backup_${Date.now()}.pdf"`,
    );

    // 3. Stream the file directly to the response
    const readStream = fs.createReadStream(tempFilePath);
    readStream.pipe(res);

    // 4. Automatically clean up the disk after the download finishes
    readStream.on("end", () => {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    });

    // Handle stream interruptions safely
    readStream.on("error", (err) => {
      console.error("Stream error:", err);
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      if (!res.headersSent) {
        res
          .status(500)
          .json({ success: false, message: "File stream interrupted." });
      }
    });
  } catch (error: any) {
    console.error("Error generating backup tickets:", error);

    // Handle the 404 error if the database was empty
    const statusCode =
      error.message === "No attendees found to generate tickets for."
        ? 404
        : 500;

    if (!res.headersSent) {
      res.status(statusCode).json({
        success: false,
        message: error.message || "Failed to generate tickets backup.",
      });
    }
  }
};
