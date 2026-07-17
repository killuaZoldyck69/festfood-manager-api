import { v4 as uuidv4 } from "uuid";
import { parse } from "csv-parse/sync";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { AppError } from "../../../errors/AppError";
import { buildPdfTicketsToDisk } from "../../../shared/utils/pdfGenerator";
import { CsvRow } from "../types/csv.types";
import {
  AttendeeFilterOptions,
  AttendeeListItem,
  PaginatedAttendeeResponse,
} from "../types/attendee.types";
import { Prisma } from "../../../../prisma/generated/client";

const csvRowSchema = z.object({
  name: z.string().min(1),
  email: z.email().min(1),
  studentId: z.string().min(1),
  university: z.string().min(1),
  department: z.string().min(1),
  phone: z.string().min(1),
  semester: z.string().min(1),
  team: z.string().min(1),
  role: z.string().min(1),
  segment: z.string().min(1),
});

export const uploadAttendeesFromCsv = async (
  fileBuffer: Buffer,
): Promise<{ insertedCount: number; insertedIds: string[] }> => {
  const records = parse(fileBuffer, {
    columns: (headerList) => headerList.map((header: string) => header.trim()),
    skip_empty_lines: true,
    bom: true,
    trim: true,
  }) as Record<string, unknown>[];

  const cleanedRecords: CsvRow[] = [];

  for (let i = 0; i < records.length; i++) {
    const row = records[i];

    const cleanedRow = {
      name: String(row["Name"] || "").trim(),
      email: String(row["Email"] || "")
        .trim()
        .toLowerCase(),
      studentId: String(row["Student ID"] || "").trim(),
      university: String(row["University"] || "").trim(),
      department: String(row["Department"] || "").trim(),
      phone: String(row["Phone"] || "").trim(),
      semester: String(row["Semester"] || "").trim(),
      team: String(row["Team"] || "").trim(),
      role: String(row["Role"] || "").trim(),
      segment: String(row["Segment"] || "").trim(),
    };

    const validation = csvRowSchema.safeParse(cleanedRow);
    if (!validation.success) {
      throw new AppError(
        400,
        `Row ${i + 2} (Email: ${row["Email"] || "Unknown"}) has invalid data. Error: ${validation.error.issues[0].message}`,
      );
    }

    cleanedRecords.push(validation.data);
  }

  const newAttendeesData = cleanedRecords.map((record) => ({
    ...record,
    id: uuidv4(),
    qrToken: uuidv4(),
  }));

  const insertedCount = newAttendeesData.length;

  if (insertedCount === 0) {
    throw new AppError(400, "The uploaded CSV contains no valid data.");
  }

  await prisma.attendee.createMany({
    data: newAttendeesData,
  });

  const insertedIds = newAttendeesData.map((a) => a.id);

  return { insertedCount, insertedIds };
};

export const generatePdfTicketsForIds = async (
  attendeeIds: string[],
): Promise<string> => {
  const attendees = await prisma.attendee.findMany({
    where: { id: { in: attendeeIds } },
  });
  return await buildPdfTicketsToDisk(attendees);
};

export const generateAllPdfTicketsBackup = async (): Promise<string> => {
  const attendees = await prisma.attendee.findMany({
    orderBy: { createdAt: "asc" },
  });
  return await buildPdfTicketsToDisk(attendees);
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

  if (filters.mealType === "BREAKFAST") whereClause.breakfastClaimed = true;
  else if (filters.mealType === "LUNCH") whereClause.lunchClaimed = true;

  if (filters.segment && filters.segment !== "ALL") {
    whereClause.segment = filters.segment;
  }
  if (filters.role && filters.role !== "ALL") {
    whereClause.role = filters.role;
  }

  if (filters.university && filters.university !== "ALL") {
    whereClause.university = filters.university;
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
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip,
      take: limit,
      include: {
        scanLogs: {
          where: { status: { in: ["SUCCESS", "MANUAL_OVERRIDE"] } },
          include: { volunteer: { select: { name: true, role: true } } },
        },
      },
    }),
  ]);

  const formattedAttendees: AttendeeListItem[] = attendees.map((attendee) => {
    const successLog = attendee.scanLogs[0];

    const breakfastLog = attendee.scanLogs.find(
      (log) =>
        log.mealType === "BREAKFAST" ||
        log.mealType === "FOOD" ||
        log.mealType === "OLD",
    );
    const lunchLog = attendee.scanLogs.find(
      (log) =>
        log.mealType === "LUNCH" ||
        log.mealType === "FOOD" ||
        log.mealType === "OLD",
    );

    return {
      id: attendee.id,
      name: attendee.name,
      email: attendee.email,
      studentId: attendee.studentId,
      university: attendee.university,
      department: attendee.department,
      phone: attendee.phone,
      role: attendee.role,
      segment: attendee.segment,
      semester: attendee.semester || "",
      team: attendee.team || "",
      qrToken: attendee.qrToken,
      emailStatus: attendee.emailStatus,
      foodClaimed: attendee.foodClaimed,
      breakfastClaimed: attendee.breakfastClaimed,
      breakfastClaimedAt: attendee.breakfastClaimedAt,
      lunchClaimed: attendee.lunchClaimed,
      lunchClaimedAt: attendee.lunchClaimedAt,
      claimedAt: attendee.claimedAt,
      createdAt: attendee.createdAt,
      updatedAt: attendee.updatedAt,
      scannerName: successLog?.volunteer?.name || null,
      scannerRole: successLog?.volunteer?.role || null,
      breakfastScannerName: breakfastLog?.volunteer?.name || null,
      lunchScannerName: lunchLog?.volunteer?.name || null,
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
  mealType: "BREAKFAST" | "LUNCH" | "FOOD" = "FOOD",
): Promise<AttendeeListItem> => {
  const attendee = await prisma.attendee.findUnique({
    where: { id: attendeeId },
  });

  if (!attendee) throw new AppError(404, "Attendee not found.");

  if (mealType === "BREAKFAST" && attendee.breakfastClaimed) {
    throw new AppError(409, "Attendee has already claimed their breakfast.");
  } else if (mealType === "LUNCH" && attendee.lunchClaimed) {
    throw new AppError(409, "Attendee has already claimed their lunch.");
  } else if (mealType === "FOOD" && attendee.foodClaimed) {
    throw new AppError(409, "Attendee has already claimed their food.");
  }

  return await prisma.$transaction(async (tx) => {
    const logistics = await tx.eventLogistics.findUnique({ where: { id: 1 } });

    const totalBreakfastServed = await tx.attendee.count({
      where: { breakfastClaimed: true },
    });
    const totalLunchServed = await tx.attendee.count({
      where: { lunchClaimed: true },
    });

    if (!logistics) {
      throw new AppError(400, "Event logistics not configured.");
    }

    if (
      mealType === "BREAKFAST" &&
      totalBreakfastServed >= logistics.totalBreakfastAvailable
    ) {
      throw new AppError(
        400,
        "Breakfast inventory depleted. No food available.",
      );
    } else if (
      mealType === "LUNCH" &&
      totalLunchServed >= logistics.totalLunchAvailable
    ) {
      throw new AppError(400, "Lunch inventory depleted. No food available.");
    }

    let whereClause: any = { id: attendeeId };
    let updateData: any = { foodClaimed: true, claimedAt: new Date() };

    if (mealType === "BREAKFAST") {
      whereClause.breakfastClaimed = false;
      updateData.breakfastClaimed = true;
      updateData.breakfastClaimedAt = new Date();
    } else if (mealType === "LUNCH") {
      whereClause.lunchClaimed = false;
      updateData.lunchClaimed = true;
      updateData.lunchClaimedAt = new Date();
    } else {
      whereClause.foodClaimed = false;
      updateData.breakfastClaimed = true;
      updateData.breakfastClaimedAt = new Date();
      updateData.lunchClaimed = true;
      updateData.lunchClaimedAt = new Date();
    }

    const updateResult = await tx.attendee.updateMany({
      where: whereClause,
      data: updateData,
    });

    if (updateResult.count === 0) {
      throw new AppError(
        409,
        "Attendee has already claimed their food concurrently.",
      );
    }

    const updatedAttendee = await tx.attendee.findUnique({
      where: { id: attendeeId },
    });

    await tx.scanLog.create({
      data: {
        status: "MANUAL_OVERRIDE",
        volunteerId: adminId,
        attendeeId: attendee.id,
        mealType: mealType,
        scannedToken:
          mealType === "BREAKFAST"
            ? `${attendee.qrToken}-B`
            : mealType === "LUNCH"
              ? `${attendee.qrToken}-L`
              : attendee.qrToken,
      },
    });

    return {
      ...updatedAttendee!,
      semester: updatedAttendee!.semester || "",
      team: updatedAttendee!.team || "",
      scannerName: null,
      scannerRole: null,
    };
  });
};

export const processManualRevoke = async (
  attendeeId: string,
  adminId: string,
  mealType: "BREAKFAST" | "LUNCH" | "FOOD" = "FOOD",
): Promise<AttendeeListItem> => {
  const attendee = await prisma.attendee.findUnique({
    where: { id: attendeeId },
  });

  if (!attendee) throw new AppError(404, "Attendee not found.");

  if (mealType === "BREAKFAST" && !attendee.breakfastClaimed) {
    throw new AppError(409, "Attendee has not claimed breakfast.");
  } else if (mealType === "LUNCH" && !attendee.lunchClaimed) {
    throw new AppError(409, "Attendee has not claimed lunch.");
  }

  return await prisma.$transaction(async (tx) => {
    let updateData: any = {};

    if (mealType === "BREAKFAST") {
      updateData.breakfastClaimed = false;
      updateData.breakfastClaimedAt = null;
    } else if (mealType === "LUNCH") {
      updateData.lunchClaimed = false;
      updateData.lunchClaimedAt = null;
    }

    const willBreakfastBeClaimed =
      mealType === "BREAKFAST" ? false : attendee.breakfastClaimed;
    const willLunchBeClaimed =
      mealType === "LUNCH" ? false : attendee.lunchClaimed;

    if (!willBreakfastBeClaimed && !willLunchBeClaimed) {
      updateData.foodClaimed = false;
      updateData.claimedAt = null;
    }

    const updatedAttendee = await tx.attendee.update({
      where: { id: attendeeId },
      data: updateData,
    });

    await tx.scanLog.deleteMany({
      where: {
        attendeeId: attendeeId,
        mealType: mealType,
      },
    });

    return {
      ...updatedAttendee,
      semester: updatedAttendee.semester || "",
      team: updatedAttendee.team || "",
      scannerName: null,
      scannerRole: null,
    };
  });
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
  const [segmentResult, universityResult] = await Promise.all([
    prisma.attendee.groupBy({
      by: ["segment"],
      _count: { segment: true },
      orderBy: { segment: "asc" },
    }),
    prisma.attendee.groupBy({
      by: ["university"],
      _count: { university: true },
      orderBy: { university: "asc" },
    }),
  ]);

  const categories = segmentResult
    .filter((item) => item.segment)
    .map((item) => ({
      name: item.segment as string,
      count: item._count.segment,
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
    segment: a.segment,
    semester: a.semester || "",
    team: a.team || "",
    role: a.role || "",
    qrToken: a.qrToken,
  }));

  return await buildPdfTicketsToDisk(ticketDataForPdf);
};
