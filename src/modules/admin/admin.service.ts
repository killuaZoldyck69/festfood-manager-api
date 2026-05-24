import { v4 as uuidv4 } from "uuid";
import { parse } from "csv-parse/sync";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import { prisma } from "../../lib/prisma";
import fs from "fs";
import path from "path";
import { AppError } from "../../errors/AppError";
import { Prisma, ScanStatus } from "../../generated/prisma/client";
import { Response } from "express";
import { buildPdfTicketsToDisk } from "../../shared/utils/pdfGenerator.util";

interface CsvRow {
  name?: string;
  email?: string;
  studentId?: string;
  university?: string;
  role?: string;
  category?: string;
  [key: string]: any;
}

export const processUploadAndGeneratePDF = async (
  fileBuffer: Buffer,
): Promise<{ insertedCount: number; fileName: string }> => {
  const records = parse(fileBuffer, {
    columns: true,
    skip_empty_lines: true,
  }) as CsvRow[];

  const requiredFields = [
    "name",
    "email",
    "studentId",
    "university",
    "role",
    "category",
  ];

  const cleanedRecords: any[] = [];
  const csvEmailsSet = new Set<string>();

  for (let i = 0; i < records.length; i++) {
    const row = records[i];

    const cleanedRow: CsvRow = {
      name: String(row.name || "").trim(),
      email: String(row.email || "")
        .trim()
        .toLowerCase(),
      studentId: String(row.studentId || "").trim(),
      university: String(row.university || "").trim(),
      role: String(row.role || "").trim(),
      category: String(row.category || "").trim(),
    };

    for (const field of requiredFields) {
      if (!cleanedRow[field]) {
        throw new AppError(
          400,
          `Row ${i + 2} (Email: ${row.email || "Unknown"}) is missing required field: '${field}'. Please fix the CSV and try again.`,
        );
      }
    }

    cleanedRecords.push(cleanedRow);
    csvEmailsSet.add(cleanedRow.email as string);
  }

  // 2. FETCH EXISTING ATTENDEES
  const csvEmails = Array.from(csvEmailsSet);
  const existingAttendees = await prisma.attendee.findMany({
    where: { email: { in: csvEmails } },
    select: { email: true },
  });

  const existingEmailSet = new Set(existingAttendees.map((a) => a.email));

  // 3. FILTER & PREPARE FOR DATABASE (Single Pass)
  const newAttendeesData = [];
  for (let i = 0; i < cleanedRecords.length; i++) {
    const record = cleanedRecords[i];
    if (!existingEmailSet.has(record.email)) {
      newAttendeesData.push({
        ...record,
        qrToken: uuidv4(),
      });
    }
  }

  // 💥 CHANGE 2: Calculate the exact number of attendees we are adding
  const insertedCount = newAttendeesData.length;

  if (insertedCount === 0) {
    throw new AppError(
      409,
      "All attendees in this CSV are already in the system. No duplicate tickets were created.",
    );
  }

  // 💥 CHANGE 3: Insert into the database BEFORE generating the PDF
  // This ensures your database updates instantly, even if the PDF takes 10 seconds to build
  await prisma.attendee.createMany({
    data: newAttendeesData,
    skipDuplicates: true,
  });

  // 4. GENERATE PDF TO OS TEMP STORAGE (Memory Safe)
  const tempFilePath = await buildPdfTicketsToDisk(newAttendeesData);

  // 💥 CHANGE 4: Extract the filename and return it to the frontend
  const fileName = path.basename(tempFilePath);

  return {
    insertedCount, // Send back the exact number of successfully inserted rows
    fileName, // Send back the filename so the frontend can request the stream
  };

  // 💥 CHANGE 5: Removed the fs.readFileSync and the finally { fs.unlinkSync() } block!
  // The frontend will now call the GET /api/admin/tickets/download-temp/:filename route
  // to stream the file and show the progress bar.
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
  limit: number = 25,
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

// 💥 Extract the Database and PDF logic here
export const prepareAllTicketsBackup = async (): Promise<string> => {
  // 1. Fetch all attendees
  const attendees = await prisma.attendee.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (!attendees || attendees.length === 0) {
    // Throw an error that the controller will catch
    throw new Error("No attendees found to generate tickets for.");
  }

  // 2. Generate PDF via our central utility
  const tempFilePath = await buildPdfTicketsToDisk(attendees);

  return tempFilePath;
};
