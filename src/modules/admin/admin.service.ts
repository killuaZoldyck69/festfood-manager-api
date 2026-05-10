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

// src/modules/admin/admin.service.ts

export const getAttendeesList = async (searchQuery?: string) => {
  // If a search string exists, build a dynamic filter
  const whereClause: any = searchQuery
    ? {
        OR: [
          { name: { contains: searchQuery, mode: "insensitive" } },
          { university: { contains: searchQuery, mode: "insensitive" } },
          { qrToken: { contains: searchQuery, mode: "insensitive" } },
        ],
      }
    : {};

  const attendees = await prisma.attendee.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 500,
    // 💥 NEW: Fetch the related scan log and the user who performed it
    include: {
      scanLogs: {
        where: { status: "SUCCESS" }, // We only care about the successful scan
        include: {
          volunteer: {
            select: {
              name: true,
              role: true,
            },
          },
        },
      },
    },
  });

  // Flatten the response so the frontend doesn't have to deal with nested arrays
  return attendees.map((attendee) => {
    // Extract the successful scan log (if it exists)
    const successLog = attendee.scanLogs[0];

    // Remove the raw 'scanLogs' array from the final output
    const { scanLogs, ...attendeeData } = attendee;

    return {
      ...attendeeData,
      scannerName: successLog?.volunteer?.name || null,
      scannerRole: successLog?.volunteer?.role || null,
    };
  });
};

export const processManualOverride = async (
  attendeeId: string,
  adminId: string,
) => {
  // 1. Find the attendee
  const attendee = await prisma.attendee.findUnique({
    where: { id: attendeeId },
  });

  if (!attendee) {
    return { status: 404, error: "Attendee not found." };
  }

  // 2. Check if already claimed
  if (attendee.foodClaimed) {
    return { status: 409, error: "Attendee has already claimed their food." };
  }

  // 3. Process the override atomically
  const [updatedAttendee, log, inventory] = await prisma.$transaction([
    // Mark as claimed
    prisma.attendee.update({
      where: { id: attendeeId },
      data: { foodClaimed: true, claimedAt: new Date() },
    }),
    // Log the manual override
    prisma.scanLog.create({
      data: {
        status: "MANUAL_OVERRIDE",
        volunteerId: adminId, // The admin who clicked the button
        attendeeId: attendee.id,
        scannedToken: attendee.qrToken, // We log their token for traceability
      },
    }),
    // Decrease the inventory safely
    prisma.eventLogistics.updateMany({
      where: { id: 1, totalAvailable: { gt: 0 } },
      data: { totalAvailable: { decrement: 1 } },
    }),
  ]);

  return { status: 200, attendee: updatedAttendee };
};

export const getSystemLogs = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  // Run the count and the fetch simultaneously
  const [totalLogs, rawLogs] = await Promise.all([
    prisma.scanLog.count(),
    prisma.scanLog.findMany({
      skip: skip,
      take: limit,
      orderBy: { scannedAt: "desc" }, // Newest scans at the top!
      include: {
        volunteer: {
          select: { name: true, role: true },
        },
        attendee: {
          select: { name: true, university: true }, // We include this in case it was a SUCCESS or DUPLICATE
        },
      },
    }),
  ]);

  // Flatten the response beautifully for the mobile app
  const formattedLogs = rawLogs.map((log) => ({
    id: log.id,
    status: log.status,
    scannedToken: log.scannedToken,
    scannedAt: log.scannedAt,
    volunteerName: log.volunteer?.name || "Unknown",
    attendeeName: log.attendee?.name || null, // Will be null if it was a fake/INVALID ticket
  }));

  return {
    meta: {
      totalLogs,
      currentPage: page,
      totalPages: Math.ceil(totalLogs / limit),
      hasMore: page * limit < totalLogs,
    },
    logs: formattedLogs,
  };
};
