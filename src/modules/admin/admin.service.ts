import { v4 as uuidv4 } from "uuid";
import { parse } from "csv-parse/sync";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import { prisma } from "../../lib/prisma";
import fs from "fs";
import path from "path";

interface AttendeeData {
  name: string;
  email: string;
  university: string;
  role: string;
  category: string;
  qrToken: string;
}

export const processUploadAndGeneratePDF = async (
  fileBuffer: Buffer,
): Promise<string> => {
  // 1. CSV Parsing and De-duplication
  const records = parse(fileBuffer, { columns: true, skip_empty_lines: true });
  const csvEmails = records.map((r: any) => r.email).filter(Boolean);
  const existingAttendees = await prisma.attendee.findMany({
    where: { email: { in: csvEmails } },
    select: { email: true },
  });
  const existingEmailSet = new Set(existingAttendees.map((a) => a.email));

  const newAttendeesData = records
    .filter((record: any) => !existingEmailSet.has(record.email))
    .map((record: any) => ({
      name: record.name,
      email: record.email,
      university: record.university,
      role: record.role,
      category: record.category,
      qrToken: uuidv4(),
    }));

  if (newAttendeesData.length === 0) {
    throw new Error(
      "No new attendees to add. All emails in this CSV already exist.",
    );
  }

  // 2. Atomic Database Insert
  await prisma.attendee.createMany({
    data: newAttendeesData,
    skipDuplicates: true,
  });

  // 3. ASSET LOADING (QR Logo, Dept Logo, Banner)
  const qrLogoPath = path.resolve(process.cwd(), "src/assets/logo.jpg");
  const deptLogoPath = path.resolve(process.cwd(), "src/assets/dept-logo.jpg");
  const bannerPath = path.resolve(process.cwd(), "src/assets/banner.jpg");

  // Helper to safely load buffers
  const loadAsset = (filePath: string) =>
    fs.existsSync(filePath) ? fs.readFileSync(filePath) : null;

  const qrLogoBuffer = loadAsset(qrLogoPath);
  const deptLogoBuffer = loadAsset(deptLogoPath);
  const bannerBuffer = loadAsset(bannerPath);

  // 4. Generate the 4-per-page Portrait PDF
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const buffers: Buffer[] = [];

  doc.on("data", buffers.push.bind(buffers));
  const pdfStringPromise = new Promise<string>((resolve, reject) => {
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData.toString("base64"));
    });
    doc.on("error", reject);
  });

  const ticketWidth = 515;
  const ticketHeight = 175;
  const startX = 40;
  const startYBase = 40;
  const spacing = 15;

  const infoWidth = ticketWidth * 0.7;
  const qrWidth = ticketWidth * 0.3;

  for (let i = 0; i < newAttendeesData.length; i++) {
    const attendee = newAttendeesData[i];

    if (i > 0 && i % 4 === 0) doc.addPage();

    const slotIndex = i % 4;
    const currentY = startYBase + slotIndex * (ticketHeight + spacing);

    // --- A. LEFT COLUMN: Fest & User Info (With Banner Background) ---

    // 1. Draw the Background Banner Image
    if (bannerBuffer) {
      doc.image(bannerBuffer, startX, currentY, {
        width: infoWidth,
        height: ticketHeight,
      });
      // Draw a dark semi-transparent overlay so the white text is readable
      doc
        .rect(startX, currentY, infoWidth, ticketHeight)
        .fillOpacity(0.85)
        .fill("#0f172a");
      doc.fillOpacity(1); // CRITICAL: Reset opacity back to 100% for the text!
    } else {
      // Fallback if banner image is missing
      doc.rect(startX, currentY, infoWidth, ticketHeight).fill("#0f172a");
    }

    // 2. Draw Department Logo
    let headerTextX = startX + 20; // Default X if no logo
    if (deptLogoBuffer) {
      // Draw the circular logo 40x40px
      doc.image(deptLogoBuffer, startX + 15, currentY + 15, { width: 40 });
      headerTextX = startX + 65; // Push the text to the right of the logo
    }

    // 3. Header Text
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("SMUCT CSE FEST V3", headerTextX, currentY + 15, {
        width: infoWidth - headerTextX + startX,
      });
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#cbd5e1")
      .text(
        "Shanto-Mariam University of Creative Technology",
        headerTextX,
        currentY + 35,
      );

    // 4. Status Block (Using bright orange to match your banner!)
    doc.rect(startX + 15, currentY + 65, 90, 20).fill("#ea580c");
    doc
      .fillColor("#ffffff")
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("FOOD PASS", startX + 15, currentY + 71, {
        width: 90,
        align: "center",
        characterSpacing: 1,
      });

    // 5. User Details
    const detailsY = currentY + 95;
    const labelX = startX + 15;
    const valueX = startX + 85;
    const rowSpacing = 16;

    const drawRow = (label: string, value: string, yOffset: number) => {
      doc
        .fontSize(9)
        .fillColor("#94a3b8")
        .font("Helvetica")
        .text(label, labelX, detailsY + yOffset);
      doc
        .fontSize(9)
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .text(value, valueX, detailsY + yOffset);
    };

    drawRow("Name:", attendee.name, 0);
    drawRow("Email:", attendee.email, rowSpacing);
    drawRow("Category:", attendee.category, rowSpacing * 2);
    drawRow("Role:", attendee.role, rowSpacing * 3);

    // --- B. RIGHT COLUMN: QR Code (White Background) ---

    // Fill the right side with solid white so the QR scans easily
    doc
      .rect(startX + infoWidth, currentY, qrWidth, ticketHeight)
      .fillAndStroke("#ffffff", "#1e293b");

    // Label
    doc
      .fillColor("#1e293b")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("SCAN FOR FOOD", startX + infoWidth, currentY + 15, {
        width: qrWidth,
        align: "center",
      });

    // Generate Base QR Code
    const qrImage = await QRCode.toBuffer(attendee.qrToken, {
      errorCorrectionLevel: "H",
      margin: 1,
    });

    const qrSize = 100;
    const qrX = startX + infoWidth + qrWidth / 2 - qrSize / 2;
    const qrY = currentY + 35;

    // Draw the QR Code
    doc.image(qrImage, qrX, qrY, { width: qrSize });

    // Overlay the custom logo in the QR code
    if (qrLogoBuffer) {
      const logoSize = 24;
      const logoX = qrX + qrSize / 2 - logoSize / 2;
      const logoY = qrY + qrSize / 2 - logoSize / 2;

      doc
        .rect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4)
        .fill("#ffffff");
      doc.image(qrLogoBuffer, logoX, logoY, { width: logoSize });
    }

    // Developer Signature
    doc
      .fontSize(7)
      .font("Helvetica-Oblique")
      .fillColor("#94a3b8")
      .text(
        "Developed by Shishimaru",
        startX + infoWidth,
        currentY + ticketHeight - 15,
        { width: qrWidth, align: "center" },
      );

    // --- C. DRAW THE TICKET BORDER LAST ---
    // Drawing it last ensures it frames the banner image perfectly
    doc
      .rect(startX, currentY, ticketWidth, ticketHeight)
      .lineWidth(1.5)
      .strokeColor("#1e293b")
      .stroke();
  }

  doc.end();
  return pdfStringPromise;
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
