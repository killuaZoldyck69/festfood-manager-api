import { Request, Response } from "express";
import { processUploadAndGeneratePDF } from "./admin.service";

export const handleCsvUpload = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No CSV file uploaded." });
    }

    // Pass the file buffer and the response object to the service
    await processUploadAndGeneratePDF(req.file.buffer, res);

    // Note: We don't return res.json() here because the service is streaming the PDF directly!
  } catch (error) {
    console.error("Upload Error:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ error: "Failed to process CSV and generate PDF." });
    }
  }
};
