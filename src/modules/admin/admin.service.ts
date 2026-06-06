import { v4 as uuidv4 } from "uuid";
import { parse } from "csv-parse/sync";
import { prisma } from "../../lib/prisma";
import fs from "fs";
import path from "path";
import { AppError } from "../../errors/AppError";
import { Response } from "express";
import { buildPdfTicketsToDisk } from "../../shared/utils/pdfGenerator";
import { auth } from "../../lib/auth";
import { ScanStatus } from "../../../prisma/generated/enums";
import { Prisma } from "../../../prisma/generated/client";

interface CsvRow {
  name?: string;
  email?: string;
  studentId?: string;
  university?: string;
  role?: string;
  category?: string;
  semester?: string;
  section?: string;
  [key: string]: any;
}

export interface GetSystemLogsParams {
  page: number;
  limit: number;
  status?: "ALL" | ScanStatus | "MANUAL_OVERRIDE";
  search?: string;
  volunteerEmail?: string;
  category?: string;
}

export interface GetAttendeesParams {
  searchQuery?: string;
  page?: number;
  limit?: number;
  status?: "ALL" | "CLAIMED" | "PENDING";
  category?: string;
  university?: string;
}

export const processUploadAndGeneratePDF = async (
  fileBuffer: Buffer,
): Promise<{ insertedCount: number; fileName: string }> => {
  const records = parse(fileBuffer, {
    columns: true,
    skip_empty_lines: true,
  }) as CsvRow[];

  // 💥 ADDED semester and section to required fields
  const requiredFields = [
    "name",
    "email",
    "studentId",
    "university",
    "role",
    "category",
    "semester",
    "section",
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
      semester: String(row.semester || "").trim(), // 💥 NEW
      section: String(row.section || "").trim(), // 💥 NEW
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

  // 3. FILTER & PREPARE FOR DATABASE
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

  // 4. GENERATE PDF
  const tempFilePath = await buildPdfTicketsToDisk(newAttendeesData);
  const fileName = path.basename(tempFilePath);

  return {
    insertedCount,
    fileName,
  };
};

export const updateLogisticsInventory = async (totalAvailable: number) => {
  return prisma.eventLogistics.upsert({
    where: { id: 1 },
    update: { totalAvailable },
    create: { id: 1, totalAvailable },
  });
};

export const getAttendeesList = async ({
  searchQuery,
  page = 1,
  limit = 25,
  status = "ALL",
  category,
  university,
}: GetAttendeesParams) => {
  const skip = (page - 1) * limit;
  const whereClause: Prisma.AttendeeWhereInput = {};

  // 1. Exact Match Filters
  if (status === "CLAIMED") whereClause.foodClaimed = true;
  else if (status === "PENDING") whereClause.foodClaimed = false;

  if (category && category !== "ALL") whereClause.category = category;
  if (university && university !== "ALL") whereClause.university = university;

  // 2. Broad Text Search
  if (searchQuery && searchQuery.trim() !== "") {
    const term = searchQuery.trim();
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
      currentFilters: {
        status,
        category: category || "ALL",
        university: university || "ALL",
        search: searchQuery || null,
      },
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

export const getSystemLogs = async ({
  page,
  limit,
  status = "ALL",
  search,
  volunteerEmail,
  category,
}: GetSystemLogsParams) => {
  const skip = (page - 1) * limit;
  const whereClause: Prisma.ScanLogWhereInput = {};

  // 1. Status Filter
  if (status && status !== "ALL") {
    whereClause.status = status as ScanStatus;
  }

  // 2. Volunteer Email Filter (Strict Match)
  if (volunteerEmail && volunteerEmail.trim() !== "") {
    whereClause.volunteer = {
      // 💥 Strict equality match on the email field
      email: volunteerEmail.trim(),
    };
  }

  // 3. Attendee Filters (Category + Search)
  const attendeeFilter: Prisma.AttendeeWhereInput = {};

  if (category && category !== "ALL") {
    attendeeFilter.category = category;
  }

  if (search && search.trim() !== "") {
    const searchTerm = search.trim();
    attendeeFilter.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { email: { contains: searchTerm, mode: "insensitive" } },
      { studentId: { contains: searchTerm, mode: "insensitive" } },
      { university: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  // If we applied any attendee filters, attach them to the main whereClause
  if (Object.keys(attendeeFilter).length > 0) {
    whereClause.attendee = attendeeFilter;
  }

  // Execute queries in parallel
  const [totalLogs, rawLogs] = await Promise.all([
    prisma.scanLog.count({ where: whereClause }),
    prisma.scanLog.findMany({
      where: whereClause,
      skip: skip,
      take: limit,
      orderBy: { scannedAt: "desc" },
      include: {
        // 💥 Added email to the select so it's available if you want to display it
        volunteer: { select: { name: true, role: true, email: true } },
        attendee: {
          select: {
            name: true,
            university: true,
            category: true,
            email: true,
            studentId: true,
            semester: true,
            section: true,
          },
        },
      },
    }),
  ]);

  const formattedLogs = rawLogs.map((log) => ({
    id: log.id,
    status: log.status,
    scannedToken: log.scannedToken,
    scannedAt: log.scannedAt,
    volunteerName: log.volunteer?.name || "Unknown",
    volunteerEmail: log.volunteer?.email || "Unknown", // 💥 Included in formatting
    volunteerRole: log.volunteer?.role || "Unknown",
    attendeeName: log.attendee?.name || null,
    attendeeUniversity: log.attendee?.university || null,
    attendeeCategory: log.attendee?.category || null,
    attendeeEmail: log.attendee?.email || null,
    attendeeStudentId: log.attendee?.studentId || null,
    attendeeSemester: log.attendee?.semester || null,
    attendeeSection: log.attendee?.section || null,
  }));

  return {
    meta: {
      totalLogs,
      currentPage: page,
      totalPages: Math.ceil(totalLogs / limit),
      hasMore: page * limit < totalLogs,
      currentFilters: {
        status,
        search: search || null,
        volunteerEmail: volunteerEmail || null, // 💥 Reflected in the meta payload
        category: category || null,
      },
    },
    logs: formattedLogs,
  };
};

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

// 1. DANGER: Delete All Attendees (and their Scan Logs)
export const wipeAllAttendees = async () => {
  // We delete ScanLogs first to ensure a perfectly clean slate,
  // otherwise, they will just be orphaned with attendeeId = null
  await prisma.scanLog.deleteMany({});

  const result = await prisma.attendee.deleteMany({});

  return {
    deletedCount: result.count,
    message: `Successfully deleted ${result.count} attendees and cleared all scan logs.`,
  };
};

// 2. Reset Event Logistics (Singleton Table)
export const resetEventInventory = async () => {
  const logistics = await prisma.eventLogistics.upsert({
    where: { id: 1 },
    update: { totalAvailable: 0 }, // Reset inventory to 0
    create: { id: 1, totalAvailable: 0 },
  });

  return logistics;
};

// 3. Fetch All Volunteers (For the management list)
export const getVolunteersList = async () => {
  // Query 1: Fetch the base volunteer data and their TOTAL scan count
  const volunteers = await prisma.user.findMany({
    where: { role: "VOLUNTEER" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: {
        select: { scanLogs: true }, // The total database count
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Extract just the IDs to filter our next query
  const volunteerIds = volunteers.map((v) => v.id);

  // Query 2: Ask the database to count all statuses grouped by Volunteer and Status
  // This generates a highly optimized SQL GROUP BY query
  const groupedStats = await prisma.scanLog.groupBy({
    by: ["volunteerId", "status"],
    _count: {
      status: true,
    },
    where: {
      volunteerId: { in: volunteerIds },
    },
  });

  // Finally, attach the database counts to the correct volunteer objects
  return volunteers.map((volunteer) => {
    // Filter the grouped results for this specific volunteer
    const myStats = groupedStats.filter(
      (stat) => stat.volunteerId === volunteer.id,
    );

    return {
      id: volunteer.id,
      name: volunteer.name,
      email: volunteer.email,
      createdAt: volunteer.createdAt,
      stats: {
        total: volunteer._count.scanLogs,
        // Safely extract the counts, defaulting to 0 if they haven't made that type of scan yet
        success:
          myStats.find((s) => s.status === "SUCCESS")?._count.status || 0,
        duplicate:
          myStats.find((s) => s.status === "DUPLICATE")?._count.status || 0,
        invalid:
          myStats.find((s) => s.status === "INVALID")?._count.status || 0,
      },
    };
  });
};

// 4. Delete Volunteer (Cascade)
export const removeVolunteer = async (volunteerId: string) => {
  // Because your schema uses `onDelete: Cascade` for accounts, sessions,
  // and scanLogs on the User model, Prisma will automatically wipe
  // everything associated with this volunteer safely!

  const existingUser = await prisma.user.findUnique({
    where: { id: volunteerId },
  });
  if (!existingUser) throw new AppError(404, "Volunteer not found.");
  if (existingUser.role === "ADMIN")
    throw new AppError(403, "Cannot delete other Admins.");

  await prisma.user.delete({
    where: { id: volunteerId },
  });

  return { message: "Volunteer and all associated data successfully deleted." };
};

export const registerVolunteerAccount = async (
  name: string,
  email: string,
  password: string,
) => {
  // 1. Ensure the email isn't already taken
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError(400, "An account with this email already exists.");
  }

  // 2. Call Better-Auth directly on the server
  // This hashes the password, creates the Account, and applies your custom 'role' field automatically
  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      role: "VOLUNTEER",
    },
  });

  // Return the newly created user data (without returning the session token!)
  return result.user;
};

export const getAttendeeFilterOptions = async () => {
  const [categoryResult, universityResult] = await Promise.all([
    // Group by category and count
    prisma.attendee.groupBy({
      by: ["category"],
      _count: { category: true },
      orderBy: { category: "asc" },
    }),
    // Group by university and count
    prisma.attendee.groupBy({
      by: ["university"],
      _count: { university: true },
      orderBy: { university: "asc" },
    }),
  ]);

  // Clean the data: extract name and count, and filter out any null/empty strings
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

  return {
    categories,
    universities,
  };
};

export const getLogFilterOptions = async () => {
  // 1. Group and count by volunteerId directly on ScanLog
  const volunteerLogs = await prisma.scanLog.groupBy({
    by: ["volunteerId"],
    _count: { id: true },
  });

  // Fetch the actual names and emails for those specific volunteers
  const users = await prisma.user.findMany({
    where: { id: { in: volunteerLogs.map((v) => v.volunteerId) } },
    select: { id: true, name: true, email: true }, // 💥 Added email here
  });

  // Map the ID to an object containing both name and email
  const userMap = new Map(
    users.map((u) => [u.id, { name: u.name, email: u.email }]),
  );

  const volunteers = volunteerLogs
    .map((v) => {
      const userData = userMap.get(v.volunteerId) || {
        name: "Unknown",
        email: "unknown",
      };
      return {
        name: userData.name,
        email: userData.email,
        count: v._count.id,
      };
    })
    .sort((a, b) => b.count - a.count); // Highest counts first

  // 2. Group and count by attendeeId directly on ScanLog (ignore nulls)
  const attendeeLogs = await prisma.scanLog.groupBy({
    by: ["attendeeId"],
    where: { attendeeId: { not: null } },
    _count: { id: true },
  });

  // Fetch the categories for those specific attendees
  const attendees = await prisma.attendee.findMany({
    where: {
      id: { in: attendeeLogs.map((a) => a.attendeeId as string) },
    },
    select: { id: true, category: true },
  });

  const attendeeMap = new Map(attendees.map((a) => [a.id, a.category]));
  const categoryMap = new Map<string, number>();

  for (const log of attendeeLogs) {
    const categoryName = attendeeMap.get(log.attendeeId as string);
    if (categoryName) {
      const currentCount = categoryMap.get(categoryName) || 0;
      categoryMap.set(categoryName, currentCount + log._count.id);
    }
  }

  const categories = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    categories,
    volunteers,
  };
};
