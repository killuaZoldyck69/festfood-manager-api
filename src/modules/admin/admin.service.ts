// backend/admin.service.ts
import { v4 as uuidv4 } from "uuid";
import { parse } from "csv-parse/sync";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import { prisma } from "../../lib/prisma";

export const processUploadAndGeneratePDF = async (
  fileBuffer: Buffer,
): Promise<string> => {
  const records = parse(fileBuffer, { columns: true, skip_empty_lines: true });

  // 1. Extract all emails from the uploaded CSV
  const csvEmails = records.map((r: any) => r.email).filter(Boolean);

  // 2. Query the database to find which of these emails already exist
  const existingAttendees = await prisma.attendee.findMany({
    where: { email: { in: csvEmails } },
    select: { email: true },
  });

  // Create a Set for ultra-fast lookup
  const existingEmailSet = new Set(existingAttendees.map((a) => a.email));

  // 3. Filter the CSV records to ONLY include brand new people
  const newAttendeesData = records
    .filter((record: any) => !existingEmailSet.has(record.email))
    .map((record: any) => ({
      name: record.name,
      email: record.email, // Map the new email field
      university: record.university,
      role: record.role,
      category: record.category,
      qrToken: uuidv4(),
    }));

  // 4. Safety Check: If the CSV was entirely duplicates, stop the process
  if (newAttendeesData.length === 0) {
    throw new Error(
      "No new attendees to add. All emails in this CSV already exist.",
    );
  }

  // 5. Save ONLY the new attendees to the database
  await prisma.attendee.createMany({
    data: newAttendeesData,
    skipDuplicates: true, // Extra safety net
  });

  // 6. Generate the Professional PDF ONLY for the newly added attendees
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData.toString("base64"));
      });
      doc.on("error", reject);

      const ticketWidth = 450;
      const ticketHeight = 550;
      const startX = (doc.page.width - ticketWidth) / 2;
      const startY = 80;

      for (let i = 0; i < newAttendeesData.length; i++) {
        // NOTE: We are looping over newAttendeesData, NOT the raw records
        const attendee = newAttendeesData[i];

        // --- 1. THE TICKET BORDER ---
        doc
          .rect(startX, startY, ticketWidth, ticketHeight)
          .lineWidth(1.5)
          .strokeColor("#1e293b")
          .stroke();

        // --- 2. THE BRANDED HEADER BLOCK ---
        doc
          .rect(startX, startY, ticketWidth, 90)
          .fillAndStroke("#0f172a", "#0f172a");

        doc
          .fillColor("#ffffff")
          .fontSize(24)
          .font("Helvetica-Bold")
          .text("SMUCT CSE FEST V3 2026", startX, startY + 25, {
            width: ticketWidth,
            align: "center",
          });

        doc
          .fillColor("#94a3b8")
          .fontSize(12)
          .font("Helvetica-Oblique")
          .text("OFFICIAL FOOD PASS", startX, startY + 55, {
            width: ticketWidth,
            align: "center",
            characterSpacing: 2,
          });

        // --- 3. THE PARTICIPANT DETAILS ---
        const detailsY = startY + 130;
        const labelX = startX + 50;
        const valueX = startX + 150;
        const rowSpacing = 30;

        const drawRow = (label: string, value: string, yOffset: number) => {
          doc
            .fontSize(12)
            .fillColor("#64748b")
            .font("Helvetica")
            .text(label, labelX, detailsY + yOffset);
          doc
            .fontSize(12)
            .fillColor("#0f172a")
            .font("Helvetica-Bold")
            .text(value, valueX, detailsY + yOffset);
        };

        drawRow("Name:", attendee.name, 0);
        drawRow("Email:", attendee.email, rowSpacing); // Email now guaranteed to exist
        drawRow("University:", attendee.university, rowSpacing * 2);
        drawRow("Role:", attendee.role, rowSpacing * 3);
        drawRow("Category:", attendee.category, rowSpacing * 4);

        const dividerY = detailsY + rowSpacing * 4 + 40;
        doc
          .moveTo(startX + 50, dividerY)
          .lineTo(startX + ticketWidth - 50, dividerY)
          .lineWidth(1)
          .strokeColor("#e2e8f0")
          .stroke();

        // --- 4. THE QR CODE ---
        const qrImage = await QRCode.toBuffer(attendee.qrToken, {
          errorCorrectionLevel: "H",
          margin: 1,
        });
        const qrSize = 160;
        const qrY = dividerY + 30;
        doc.image(qrImage, startX + ticketWidth / 2 - qrSize / 2, qrY, {
          width: qrSize,
        });

        // --- 5. THE FOOTER ---
        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#64748b")
          .text(
            "Please present this QR code to the volunteers at the food counter.",
            startX + 30,
            qrY + qrSize + 25,
            { width: ticketWidth - 60, align: "center" },
          );

        if (i < newAttendeesData.length - 1) doc.addPage();
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

export const getAttendeesList = async (
  searchQuery?: string,
  page: number = 1,
  limit: number = 50,
  status: "ALL" | "CLAIMED" | "PENDING" = "ALL", // Add the new parameter
) => {
  const skip = (page - 1) * limit;

  // 1. Build the base search filter
  const whereClause: any = searchQuery
    ? {
        OR: [
          { name: { contains: searchQuery, mode: "insensitive" } },
          { university: { contains: searchQuery, mode: "insensitive" } },
          { qrToken: { contains: searchQuery, mode: "insensitive" } },
        ],
      }
    : {};

  // 2. Inject the status filter
  if (status === "CLAIMED") {
    whereClause.foodClaimed = true;
  } else if (status === "PENDING") {
    whereClause.foodClaimed = false;
  }

  // 3. Run the count and fetch simultaneously
  const [totalCount, attendees] = await Promise.all([
    prisma.attendee.count({ where: whereClause }),
    prisma.attendee.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: skip,
      take: limit,
      include: {
        scanLogs: {
          where: { status: "SUCCESS" },
          include: {
            volunteer: {
              select: { name: true, role: true },
            },
          },
        },
      },
    }),
  ]);

  // 4. Flatten the response
  const formattedAttendees = attendees.map((attendee) => {
    const successLog = attendee.scanLogs[0];
    const { scanLogs, ...attendeeData } = attendee;

    return {
      ...attendeeData,
      scannerName: successLog?.volunteer?.name || null,
      scannerRole: successLog?.volunteer?.role || null,
    };
  });

  return {
    meta: {
      totalAttendees: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: page * limit < totalCount,
      currentFilter: status, // Let the frontend know which filter was applied
    },
    attendees: formattedAttendees,
  };
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
