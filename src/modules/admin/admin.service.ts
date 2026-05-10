import { v4 as uuidv4 } from "uuid";
import { parse } from "csv-parse/sync";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import { Response } from "express";
import { prisma } from "../../lib/prisma";

export const processUploadAndGeneratePDF = async (
  fileBuffer: Buffer,
  res: Response,
) => {
  // 1. Parse the CSV file in memory
  const records = parse(fileBuffer, {
    columns: true,
    skip_empty_lines: true,
  });

  // 2. Prepare the data for the database
  const attendeesData = records.map((record: any) => ({
    name: record.name,
    university: record.university,
    role: record.role,
    category: record.category,
    qrToken: uuidv4(), // Generate a unique, unguessable string for the QR code
  }));

  // 3. Save to Database efficiently in one transaction
  await prisma.attendee.createMany({
    data: attendeesData,
    skipDuplicates: true,
  });

  // 4. Generate the PDF and stream it directly to the HTTP response
  const doc = new PDFDocument({ size: "A4" });

  // Set headers so the browser/app knows it's receiving a PDF file
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=tickets.pdf");
  doc.pipe(res);

  // 5. Draw the PDF Pages
  for (let i = 0; i < attendeesData.length; i++) {
    const attendee = attendeesData[i];

    // Convert the unique token into a QR code image buffer
    const qrImage = await QRCode.toBuffer(attendee.qrToken);

    // Draw the ticket
    doc.fontSize(24).text("FestFood Ticket", { align: "center" });
    doc.moveDown();
    doc.fontSize(16).text(`Name: ${attendee.name}`);
    doc.text(`University: ${attendee.university}`);
    doc.text(`Role: ${attendee.role}`);

    // Draw the QR Code
    doc.image(qrImage, doc.page.width / 2 - 75, doc.y + 20, { width: 150 });

    // Add a new page for the next ticket (unless it's the last one)
    if (i < attendeesData.length - 1) {
      doc.addPage();
    }
  }

  // Finalize the PDF (this closes the stream and completes the HTTP request)
  doc.end();
};
