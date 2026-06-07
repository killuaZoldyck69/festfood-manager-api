import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { uploadAttendeesFromCsv } from "../../src/modules/admin/services/attendee.service";
import { prisma } from "../../src/lib/prisma";
import { AppError } from "../../src/errors/AppError";

const prismaMock = prisma as any;

// Mock the PDF generator so we don't try to actually write PDFs during tests
vi.mock("../../src/shared/utils/pdfGenerator", () => ({
  buildPdfTicketsToDisk: vi.fn().mockResolvedValue("/tmp/mock-tickets.pdf"),
}));

describe("Unit: Attendee Service (CSV Upload)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.attendee.findMany.mockResolvedValue([]);
    prismaMock.attendee.createMany.mockResolvedValue({ count: 0 });
  });

  it("rejects CSV row with missing required field", async () => {
    const buffer = fs.readFileSync(
      path.join(__dirname, "../fixtures/missing-fields.csv"),
    );
    await expect(uploadAttendeesFromCsv(buffer)).rejects.toThrow(AppError);
  });

  it("rejects CSV row with whitespace-only field", async () => {
    const csvWithWhitespace = `name,email,studentId,university,role,category,semester,section
John Doe,john@example.com,S001,Uni,Student,Cat, ,A`; // Semester is just space
    await expect(
      uploadAttendeesFromCsv(Buffer.from(csvWithWhitespace)),
    ).rejects.toThrow(AppError);
  });

  it("rejects CSV row with invalid email format", async () => {
    const buffer = fs.readFileSync(
      path.join(__dirname, "../fixtures/invalid-email.csv"),
    );
    await expect(uploadAttendeesFromCsv(buffer)).rejects.toThrow(
      /invalid email/i,
    );
  });

  it("skips existing emails and returns correct insertedCount", async () => {
    const buffer = fs.readFileSync(
      path.join(__dirname, "../fixtures/valid-attendees.csv"),
    );
    // Mock that the first 2 users already exist in the database
    prismaMock.attendee.findMany.mockResolvedValue([
      { email: "john@example.com" },
      { email: "jane@example.com" },
    ]);

    const result = await uploadAttendeesFromCsv(buffer);
    // 5 total in CSV - 2 existing = 3 inserted
    expect(result.insertedCount).toBe(3);
  });

  it("throws 409 when all rows already exist in database", async () => {
    const buffer = fs.readFileSync(
      path.join(__dirname, "../fixtures/valid-attendees.csv"),
    );
    // Mock that ALL users already exist
    prismaMock.attendee.findMany.mockResolvedValue([
      { email: "john@example.com" },
      { email: "jane@example.com" },
      { email: "alice@example.com" },
      { email: "bob@example.com" },
      { email: "charlie@example.com" },
    ]);

    await expect(uploadAttendeesFromCsv(buffer)).rejects.toThrow(
      /already in the system/,
    );
  });

  it("correctly inserts new attendees and generates qrToken per row", async () => {
    const buffer = fs.readFileSync(
      path.join(__dirname, "../fixtures/valid-attendees.csv"),
    );

    await uploadAttendeesFromCsv(buffer);

    expect(prismaMock.attendee.createMany).toHaveBeenCalled();
    const createData = prismaMock.attendee.createMany.mock.calls[0][0].data;
    expect(createData).toHaveLength(5);
    expect(createData[0]).toHaveProperty("qrToken");
  });
});
