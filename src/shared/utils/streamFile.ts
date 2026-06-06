import fs from "fs";
import path from "path";
import os from "os";
import { Response } from "express";
import { AppError } from "../../errors/AppError";
import { logger } from "../logger";

export const streamFileToResponse = (
  res: Response,
  filePath: string,
  filename: string,
): void => {
  const resolvedPath = path.resolve(filePath);
  const tmpDirPath = path.resolve(os.tmpdir());

  if (!resolvedPath.startsWith(tmpDirPath)) {
    throw new AppError(400, "Invalid file path. Path traversal detected.");
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new AppError(404, "File not found.");
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  const readStream = fs.createReadStream(resolvedPath);

  readStream.pipe(res);

  readStream.on("end", () => {
    fs.unlink(resolvedPath, (err) => {
      if (err) {
        logger.error({ err }, "Failed to delete temporary file.");
      }
    });
  });

  readStream.on("error", (err) => {
    logger.error({ err }, "Error streaming file.");
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error streaming file.",
        errorSources: [],
      });
    }
  });
};
