import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildPdfTicketsToDisk,
  AttendeeTicketData,
} from "../../src/shared/utils/pdfGenerator";
import fs from "fs";
import os from "os";
import QRCode from "qrcode";
// Import the mocked library so we can track its calls in the tests
import PDFDocument from "pdfkit";

// 1. Mock external file system and QR libraries
vi.mock("fs");
vi.mock("os");
vi.mock("qrcode", () => ({
  default: { toBuffer: vi.fn().mockResolvedValue(Buffer.from("fake-qr")) },
}));

// 2. Deep mock PDFKit's chainable methods to execute the drawing code safely
vi.mock("pdfkit", () => {
  const mDoc = {
    pipe: vi.fn(),
    addPage: vi.fn(),
    rect: vi.fn().mockReturnThis(),
    fillOpacity: vi.fn().mockReturnThis(),
    fill: vi.fn().mockReturnThis(),
    image: vi.fn().mockReturnThis(),
    fontSize: vi.fn().mockReturnThis(),
    font: vi.fn().mockReturnThis(),
    fillColor: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    fillAndStroke: vi.fn().mockReturnThis(),
    lineWidth: vi.fn().mockReturnThis(),
    strokeColor: vi.fn().mockReturnThis(),
    stroke: vi.fn().mockReturnThis(),
    end: vi.fn(),
  };

  // 💥 FIX: Use a standard function instead of an arrow function so it can be instantiated with `new`
  return {
    default: vi.fn().mockImplementation(function () {
      return mDoc;
    }),
  };
});

describe("Unit: PDF Generator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (os.tmpdir as any).mockReturnValue("/tmp");

    // Simulate that asset files (logos) DO exist so the background logic runs
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue(Buffer.from("fake-image"));

    // Simulate the WriteStream finishing instantly so the promise resolves
    (fs.createWriteStream as any).mockReturnValue({
      on: vi.fn((event, cb) => {
        if (event === "finish") cb();
      }),
    });
  });

  const mockAttendee: AttendeeTicketData = {
    name: "John Doe",
    email: "john@example.com",
    studentId: "12345",
    university: "Test University",
    category: "General",
    semester: "Fall 2026",
    section: "A",
    qrToken: "test-token-123",
  };

  it("generates a PDF for a single attendee", async () => {
    const filePath = await buildPdfTicketsToDisk([mockAttendee]);
    expect(filePath).toContain("tickets_");
    expect(fs.createWriteStream).toHaveBeenCalled();
  });

  it("adds a new page when generating more than 4 tickets", async () => {
    const attendees = Array(5).fill(mockAttendee); // 5 tickets = 2 pages
    await buildPdfTicketsToDisk(attendees);

    // 💥 FIX: Access the mock instance safely via the imported module
    const mockDocInstance = (PDFDocument as any).mock.results[0].value;
    expect(mockDocInstance.addPage).toHaveBeenCalledTimes(1);
  });

  it("handles missing assets gracefully (no logos found)", async () => {
    (fs.existsSync as any).mockReturnValue(false); // No logos!

    const filePath = await buildPdfTicketsToDisk([mockAttendee]);
    expect(filePath).toContain("tickets_");
  });
});
