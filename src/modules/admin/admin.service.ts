import { v4 as uuidv4 } from "uuid";
import { parse } from "csv-parse/sync";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import { prisma } from "../../lib/prisma";
import fs from "fs";
import path from "path";
import { AppError } from "../../errors/AppError";
import { Prisma, ScanStatus } from "../../generated/prisma/client";

export const processUploadAndGeneratePDF = async (
  fileBuffer: Buffer,
): Promise<string> => {
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
    throw new AppError(
      409,
      "All attendees in this CSV are already in the system. No duplicate tickets were created.",
    );
  }

  await prisma.attendee.createMany({
    data: newAttendeesData,
    skipDuplicates: true,
  });

  const qrLogoPath = path.resolve(process.cwd(), "src/assets/logo.jpg");
  const deptLogoPath = path.resolve(process.cwd(), "src/assets/dept-logo.jpg");
  const bannerPath = path.resolve(process.cwd(), "src/assets/banner.jpg");

  const loadAsset = (filePath: string) =>
    fs.existsSync(filePath) ? fs.readFileSync(filePath) : null;

  const qrLogoBuffer = loadAsset(qrLogoPath);
  const deptLogoBuffer = loadAsset(deptLogoPath);
  const bannerBuffer = loadAsset(bannerPath);

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const buffers: Buffer[] = [];

  doc.on("data", buffers.push.bind(buffers));
  const pdfStringPromise = new Promise<string>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(buffers).toString("base64")));
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

    const currentY = startYBase + (i % 4) * (ticketHeight + spacing);

    if (bannerBuffer) {
      doc.image(bannerBuffer, startX, currentY, {
        width: infoWidth,
        height: ticketHeight,
      });
      doc
        .rect(startX, currentY, infoWidth, ticketHeight)
        .fillOpacity(0.85)
        .fill("#0f172a");
      doc.fillOpacity(1);
    } else {
      doc.rect(startX, currentY, infoWidth, ticketHeight).fill("#0f172a");
    }

    let headerTextX = startX + 20;
    if (deptLogoBuffer) {
      doc.image(deptLogoBuffer, startX + 15, currentY + 15, { width: 40 });
      headerTextX = startX + 65;
    }

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

    const detailsY = currentY + 95;
    const labelX = startX + 15;
    const valueX = startX + 85;

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
    drawRow("Email:", attendee.email, 16);
    drawRow("Category:", attendee.category, 32);
    drawRow("Role:", attendee.role, 48);

    doc
      .rect(startX + infoWidth, currentY, qrWidth, ticketHeight)
      .fillAndStroke("#ffffff", "#1e293b");

    doc
      .fillColor("#1e293b")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("SCAN FOR FOOD", startX + infoWidth, currentY + 15, {
        width: qrWidth,
        align: "center",
      });

    const qrImage = await QRCode.toBuffer(attendee.qrToken, {
      errorCorrectionLevel: "H",
      margin: 1,
    });
    const qrSize = 100;
    const qrX = startX + infoWidth + qrWidth / 2 - qrSize / 2;
    const qrY = currentY + 35;

    doc.image(qrImage, qrX, qrY, { width: qrSize });

    if (qrLogoBuffer) {
      const logoSize = 24;
      const logoX = qrX + qrSize / 2 - logoSize / 2;
      const logoY = qrY + qrSize / 2 - logoSize / 2;

      doc
        .rect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4)
        .fill("#ffffff");
      doc.image(qrLogoBuffer, logoX, logoY, { width: logoSize });
    }

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
  return prisma.eventLogistics.upsert({
    where: { id: 1 },
    update: { totalAvailable },
    create: { id: 1, totalAvailable },
  });
};

export const getAttendeesList = async (
  searchQuery?: string,
  page: number = 1,
  limit: number = 50,
  status: "ALL" | "CLAIMED" | "PENDING" = "ALL",
) => {
  const skip = (page - 1) * limit;

  const whereClause: any = searchQuery
    ? {
        OR: [
          { name: { contains: searchQuery, mode: "insensitive" } },
          { university: { contains: searchQuery, mode: "insensitive" } },
          { qrToken: { contains: searchQuery, mode: "insensitive" } },
        ],
      }
    : {};

  if (status === "CLAIMED") whereClause.foodClaimed = true;
  else if (status === "PENDING") whereClause.foodClaimed = false;

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
          include: { volunteer: { select: { name: true, role: true } } },
        },
      },
    }),
  ]);

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
      currentFilter: status,
    },
    attendees: formattedAttendees,
  };
};

export const processManualOverride = async (
  attendeeId: string,
  adminId: string,
) => {
  const attendee = await prisma.attendee.findUnique({
    where: { id: attendeeId },
  });

  if (!attendee) throw new AppError(404, "Attendee not found.");
  if (attendee.foodClaimed) {
    throw new AppError(409, "Attendee has already claimed their food.");
  }

  // 💥 NEW: Strict Inventory Validation 💥
  const logistics = await prisma.eventLogistics.findUnique({
    where: { id: 1 },
  });
  if (!logistics || logistics.totalAvailable <= 0) {
    throw new AppError(400, "Override failed: No food available in inventory.");
  }

  const [updatedAttendee] = await prisma.$transaction([
    prisma.attendee.update({
      where: { id: attendeeId },
      data: { foodClaimed: true, claimedAt: new Date() },
    }),
    prisma.scanLog.create({
      data: {
        status: "MANUAL_OVERRIDE",
        volunteerId: adminId,
        attendeeId: attendee.id,
        scannedToken: attendee.qrToken,
      },
    }),
    prisma.eventLogistics.updateMany({
      where: { id: 1, totalAvailable: { gt: 0 } },
      data: { totalAvailable: { decrement: 1 } },
    }),
  ]);

  return updatedAttendee;
};

export const getSystemLogs = async (
  page: number,
  limit: number,
  status: "ALL" | ScanStatus | "MANUAL_OVERRIDE" = "ALL",
) => {
  const skip = (page - 1) * limit;
  const whereClause: Prisma.ScanLogWhereInput = {};

  if (status !== "ALL") {
    whereClause.status = status as ScanStatus;
  }

  const [totalLogs, rawLogs] = await Promise.all([
    prisma.scanLog.count({ where: whereClause }),
    prisma.scanLog.findMany({
      where: whereClause,
      skip: skip,
      take: limit,
      orderBy: { scannedAt: "desc" },
      include: {
        volunteer: { select: { name: true, role: true } },
        attendee: { select: { name: true, university: true, category: true } },
      },
    }),
  ]);

  const formattedLogs = rawLogs.map((log) => ({
    id: log.id,
    status: log.status,
    scannedToken: log.scannedToken,
    scannedAt: log.scannedAt,
    volunteerName: log.volunteer?.name || "Unknown",
    volunteerRole: log.volunteer?.role || "Unknown",
    attendeeName: log.attendee?.name || null,
    attendeeUniversity: log.attendee?.university || null,
    attendeeCategory: log.attendee?.category || null,
  }));

  return {
    meta: {
      totalLogs,
      currentPage: page,
      totalPages: Math.ceil(totalLogs / limit),
      hasMore: page * limit < totalLogs,
      currentFilter: status,
    },
    logs: formattedLogs,
  };
};
