import { v4 as uuidv4 } from "uuid";
import { parse } from "csv-parse/sync";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { AppError } from "../../../errors/AppError";
import { buildPdfTicketsToDisk } from "../../../shared/utils/pdfGenerator";
import { assertInventoryAvailable } from "../../../shared/utils/inventory";

import { AttendeeTicketData } from "../../../shared/utils/pdfGenerator";
import { CsvRow } from "../types/csv.types";
import {
  AttendeeFilterOptions,
  AttendeeListItem,
  PaginatedAttendeeResponse,
} from "../types/attendee.types";
import { Prisma } from "../../../../prisma/generated/client";

const csvRowSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  studentId: z.string().min(1),
  university: z.string().min(1),
  role: z.string().min(1),
  category: z.string().min(1),
  semester: z.string().min(1),
  section: z.string().min(1),
});

export const uploadAttendeesFromCsv = async (
  fileBuffer: Buffer,
): Promise<{ insertedCount: number; fileName: string }> => {
  const records = parse(fileBuffer, {
    columns: true,
    skip_empty_lines: true,
  }) as Record<string, any>[]; // Explicit cast to fix 'unknown' type error

  const cleanedRecords: CsvRow[] = [];
  const csvEmailsSet = new Set<string>();

  for (let i = 0; i < records.length; i++) {
    const row = records[i];

    const cleanedRow = {
      name: String(row.name || "").trim(),
      email: String(row.email || "")
        .trim()
        .toLowerCase(),
      studentId: String(row.studentId || "").trim(),
      university: String(row.university || "").trim(),
      role: String(row.role || "").trim(),
      category: String(row.category || "").trim(),
      semester: String(row.semester || "").trim(),
      section: String(row.section || "").trim(),
    };

    const validation = csvRowSchema.safeParse(cleanedRow);
    if (!validation.success) {
      throw new AppError(
        400,
        `Row ${i + 2} (Email: ${row.email || "Unknown"}) has invalid data. Error: ${validation.error.issues[0].message}`,
      );
    }

    cleanedRecords.push(validation.data);
    csvEmailsSet.add(validation.data.email);
  }

  const existingAttendees = await prisma.attendee.findMany({
    where: { email: { in: Array.from(csvEmailsSet) } },
    select: { email: true },
  });

  const existingEmailSet = new Set(existingAttendees.map((a) => a.email));

  const newAttendeesData = cleanedRecords
    .filter((record) => !existingEmailSet.has(record.email))
    .map((record) => ({
      ...record,
      qrToken: uuidv4(),
    }));

  const insertedCount = newAttendeesData.length;

  if (insertedCount === 0) {
    throw new AppError(
      409,
      "All attendees in this CSV are already in the system. No duplicate tickets were created.",
    );
  }

  await prisma.attendee.createMany({
    data: newAttendeesData,
    skipDuplicates: true,
  });

  const ticketDataForPdf: AttendeeTicketData[] = newAttendeesData.map((a) => ({
    name: a.name,
    email: a.email,
    studentId: a.studentId,
    university: a.university,
    category: a.category,
    semester: a.semester,
    section: a.section,
    qrToken: a.qrToken,
  }));

  const tempFilePath = await buildPdfTicketsToDisk(ticketDataForPdf);
  const fileName = require("path").basename(tempFilePath);

  return { insertedCount, fileName };
};

export const getAttendeesList = async (
  page: number,
  limit: number,
  filters: AttendeeFilterOptions,
): Promise<PaginatedAttendeeResponse> => {
  const skip = (page - 1) * limit;
  const whereClause: Prisma.AttendeeWhereInput = {};

  if (filters.status === "CLAIMED") whereClause.foodClaimed = true;
  else if (filters.status === "UNCLAIMED") whereClause.foodClaimed = false;

  if (filters.category && filters.category !== "ALL") {
    whereClause.category = filters.category;
  }
  if (filters.role && filters.role !== "ALL") {
    whereClause.role = filters.role;
  }

  if (filters.search && filters.search.trim() !== "") {
    const term = filters.search.trim();
    whereClause.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { qrToken: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { studentId: { contains: term, mode: "insensitive" } },
    ];
  }

  const [totalCount, attendees] = await Promise.all([
    prisma.attendee.count({ where: whereClause }),
    prisma.attendee.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        scanLogs: {
          where: { status: "SUCCESS" },
          include: { volunteer: { select: { name: true, role: true } } },
        },
      },
    }),
  ]);

  const formattedAttendees: AttendeeListItem[] = attendees.map((attendee) => {
    const successLog = attendee.scanLogs[0];
    return {
      id: attendee.id,
      name: attendee.name,
      email: attendee.email,
      studentId: attendee.studentId,
      university: attendee.university,
      role: attendee.role,
      category: attendee.category,
      semester: attendee.semester || "",
      section: attendee.section || "",
      qrToken: attendee.qrToken,
      foodClaimed: attendee.foodClaimed,
      claimedAt: attendee.claimedAt,
      createdAt: attendee.createdAt,
      updatedAt: attendee.updatedAt,
      scannerName: successLog?.volunteer?.name || null,
      scannerRole: successLog?.volunteer?.role || null,
    };
  });

  return {
    data: formattedAttendees,
    meta: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: page * limit < totalCount,
    },
  };
};

export const processManualOverride = async (
  attendeeId: string,
  adminId: string,
): Promise<AttendeeListItem> => {
  const attendee = await prisma.attendee.findUnique({
    where: { id: attendeeId },
  });

  if (!attendee) throw new AppError(404, "Attendee not found.");
  if (attendee.foodClaimed) {
    throw new AppError(409, "Attendee has already claimed their food.");
  }

  await assertInventoryAvailable();

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

  return {
    ...updatedAttendee,
    semester: updatedAttendee.semester || "",
    section: updatedAttendee.section || "",
    scannerName: null,
    scannerRole: null,
  };
};

export const wipeAllAttendees = async (): Promise<{
  deletedCount: number;
  message: string;
}> => {
  await prisma.scanLog.deleteMany({});
  const result = await prisma.attendee.deleteMany({});

  return {
    deletedCount: result.count,
    message: `Successfully deleted ${result.count} attendees and cleared all scan logs.`,
  };
};

export const getAttendeeFilterOptions = async (): Promise<{
  categories: { name: string; count: number }[];
  universities: { name: string; count: number }[];
}> => {
  const [categoryResult, universityResult] = await Promise.all([
    prisma.attendee.groupBy({
      by: ["category"],
      _count: { category: true },
      orderBy: { category: "asc" },
    }),
    prisma.attendee.groupBy({
      by: ["university"],
      _count: { university: true },
      orderBy: { university: "asc" },
    }),
  ]);

  const categories = categoryResult
    .filter((item) => item.category)
    .map((item) => ({
      name: item.category as string,
      count: item._count.category,
    }));

  const universities = universityResult
    .filter((item) => item.university)
    .map((item) => ({
      name: item.university as string,
      count: item._count.university,
    }));

  return { categories, universities };
};

export const prepareAllTicketsBackup = async (): Promise<string> => {
  const attendees = await prisma.attendee.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (!attendees || attendees.length === 0) {
    throw new AppError(404, "No attendees found to generate tickets for.");
  }

  const ticketDataForPdf = attendees.map((a) => ({
    name: a.name,
    email: a.email,
    studentId: a.studentId,
    university: a.university,
    category: a.category,
    semester: a.semester || "",
    section: a.section || "",
    qrToken: a.qrToken,
  }));

  return await buildPdfTicketsToDisk(ticketDataForPdf);
};
