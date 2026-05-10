// backend/admin.service.ts
import { v4 as uuidv4 } from "uuid";
import { parse } from "csv-parse/sync";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import { prisma } from "../../lib/prisma";

export const processUploadAndGeneratePDF = async (
  fileBuffer: Buffer,
): Promise<string> => {
  // 🔴 Now returns a string instead of taking the 'res' object

  const records = parse(fileBuffer, { columns: true, skip_empty_lines: true });

  const attendeesData = records.map((record: any) => ({
    name: record.name,
    university: record.university,
    role: record.role,
    category: record.category,
    qrToken: uuidv4(),
  }));

  await prisma.attendee.createMany({
    data: attendeesData,
    skipDuplicates: true,
  });

  // 🔴 Wrap the PDF generation in a Promise to wait for it to finish and extract the Base64
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData.toString("base64")); // Convert to safe Base64 string
      });
      doc.on("error", reject);

      for (let i = 0; i < attendeesData.length; i++) {
        const attendee = attendeesData[i];
        const qrImage = await QRCode.toBuffer(attendee.qrToken);

        doc.fontSize(24).text("FestFood Ticket", { align: "center" });
        doc.moveDown();
        doc.fontSize(16).text(`Name: ${attendee.name}`);
        doc.text(`University: ${attendee.university}`);
        doc.text(`Role: ${attendee.role}`);
        doc.image(qrImage, doc.page.width / 2 - 75, doc.y + 20, { width: 150 });

        if (i < attendeesData.length - 1) doc.addPage();
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export const updateLogisticsInventory = async (totalAvailable: number) => {
  const updatedLogistics = await prisma.eventLogistics.upsert({
    where: { id: 1 },
    update: { totalAvailable },
    create: { id: 1, totalAvailable },
  });

  return updatedLogistics;
};

export const getAttendeesList = async (searchQuery?: string) => {
  // If a search string exists, build a dynamic filter
  const whereClause: any = searchQuery
    ? {
        OR: [
          { name: { contains: searchQuery, mode: "insensitive" } },
          { university: { contains: searchQuery, mode: "insensitive" } },
          // We even let them search by the exact QR token string if needed
          { qrToken: { contains: searchQuery, mode: "insensitive" } },
        ],
      }
    : {};

  const attendees = await prisma.attendee.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" }, // Newest uploads first
    take: 500, // Safety limit to prevent crashing the mobile app with massive lists
  });

  return attendees;
};
