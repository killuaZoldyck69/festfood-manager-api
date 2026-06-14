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

  const stat = fs.statSync(resolvedPath);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", stat.size.toString());

  const readStream = fs.createReadStream(resolvedPath);
  let isCleanedUp = false;

  const cleanup = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;

    fs.unlink(resolvedPath, (err) => {
      if (err && err.code !== "ENOENT") {
        logger.error({ err }, "Failed to delete temporary file.");
      }
    });
  };

  readStream.pipe(res);

  readStream.on("end", cleanup);

  readStream.on("error", (err) => {
    cleanup();
    logger.error({ err }, "Error streaming file.");
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error streaming file.",
        errorSources: [],
      });
    }
  });

  res.on("close", cleanup);
};
