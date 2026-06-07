import { describe, it, expect, vi, beforeEach } from "vitest";
import { streamFileToResponse } from "../../src/shared/utils/streamFile";
import { AppError } from "../../src/errors/AppError";
import fs from "fs";
import path from "path";
import os from "os";

vi.mock("fs");
vi.mock("os");

describe("Unit: File Streamer", () => {
  let mockRes: any;
  let mockReadStream: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (os.tmpdir as any).mockReturnValue("/tmp");

    mockRes = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      headersSent: false,
    };

    mockReadStream = {
      pipe: vi.fn(),
      on: vi.fn(),
    };
    (fs.createReadStream as any).mockReturnValue(mockReadStream);
  });

  it("throws 400 AppError if path traversal is detected", () => {
    // Attempting to stream a file outside of the OS temp directory
    expect(() => {
      streamFileToResponse(mockRes, "/etc/passwd", "hack.pdf");
    }).toThrow(AppError);
  });

  it("throws 404 AppError if file does not exist", () => {
    (fs.existsSync as any).mockReturnValue(false);
    expect(() => {
      streamFileToResponse(mockRes, "/tmp/missing.pdf", "file.pdf");
    }).toThrow(AppError);
  });

  it("successfully pipes the file to the response", () => {
    (fs.existsSync as any).mockReturnValue(true);
    // Force path.resolve to return a safe path for testing on different OSes
    vi.spyOn(path, "resolve").mockImplementation((p) =>
      p.includes("tmp") ? "/tmp" : `/tmp/${p}`,
    );

    streamFileToResponse(mockRes, "test.pdf", "download.pdf");

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/pdf",
    );
    expect(mockReadStream.pipe).toHaveBeenCalledWith(mockRes);
    expect(mockReadStream.on).toHaveBeenCalledWith("end", expect.any(Function));
    expect(mockReadStream.on).toHaveBeenCalledWith(
      "error",
      expect.any(Function),
    );
  });
});
