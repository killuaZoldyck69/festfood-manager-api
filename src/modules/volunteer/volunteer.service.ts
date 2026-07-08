import { Prisma } from "../../../prisma/generated/client";
import { ScanStatus } from "../../../prisma/generated/enums";
import { prisma } from "../../lib/prisma";
import { PaginatedVolunteerLogs } from "./volunteer.types";

export interface VolunteerLogFilterOptions {
  status?: ScanStatus;
  search?: string;
}

export const getVolunteerLogs = async (
  volunteerId: string,
  page: number,
  limit: number,
  filters: VolunteerLogFilterOptions,
): Promise<PaginatedVolunteerLogs> => {
  const skip = (page - 1) * limit;

  const whereClause: Prisma.ScanLogWhereInput = { volunteerId };

  if (filters.status) {
    whereClause.status = filters.status;
  }

  const attendeeFilter: Prisma.AttendeeWhereInput = {};

  if (filters.search && filters.search.trim() !== "") {
    const term = filters.search.trim();
    attendeeFilter.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { studentId: { contains: term, mode: "insensitive" } },
      { university: { contains: term, mode: "insensitive" } },
    ];
  }

  if (Object.keys(attendeeFilter).length > 0) {
    whereClause.attendee = attendeeFilter;
  }

  const [total, rawLogs] = await Promise.all([
    prisma.scanLog.count({ where: whereClause }),
    prisma.scanLog.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { scannedAt: "desc" },
      include: {
        attendee: {
          select: {
            name: true,
            university: true,
            segment: true,
            email: true,
            studentId: true,
            semester: true,
            team: true,
            role: true,
          },
        },
        volunteer: {
          select: { name: true, email: true },
        },
      },
    }),
  ]);

  const formattedLogs = rawLogs.map((log) => ({
    id: log.id,
    status: log.status,
    scannedToken: log.scannedToken || "",
    scannedAt: log.scannedAt,
    attendeeName: log.attendee?.name || null,
    attendeeEmail: log.attendee?.email || null,
    studentId: log.attendee?.studentId || null,
    segment: log.attendee?.segment || null,
    university: log.attendee?.university || null,
    semester: log.attendee?.semester || null,
    team: log.attendee?.team || null,
    role: log.attendee?.role || null,
    volunteerName: log.volunteer?.name || null,
    volunteerEmail: log.volunteer?.email || null,
  }));

  return {
    data: formattedLogs,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
};
