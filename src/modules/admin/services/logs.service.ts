import { Prisma } from "../../../../prisma/generated/client";
import { prisma } from "../../../lib/prisma";
import {
  FormattedLog,
  LogFilterOptions,
  PaginatedLogResponse,
} from "../types/log.types";

export const getSystemLogs = async (
  page: number,
  limit: number,
  filters: LogFilterOptions,
): Promise<PaginatedLogResponse> => {
  const skip = (page - 1) * limit;
  const whereClause: Prisma.ScanLogWhereInput = {};

  if (filters.status && filters.status !== ("ALL" as any)) {
    whereClause.status = filters.status;
  }

  if (filters.volunteerEmail && filters.volunteerEmail !== "ALL") {
    whereClause.volunteer = { email: filters.volunteerEmail };
  }

  const attendeeFilter: Prisma.AttendeeWhereInput = {};

  if (filters.segment && filters.segment !== "ALL") {
    attendeeFilter.segment = filters.segment;
  }

  if (filters.search && filters.search.trim() !== "") {
    const searchTerm = filters.search.trim();
    attendeeFilter.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { email: { contains: searchTerm, mode: "insensitive" } },
      { studentId: { contains: searchTerm, mode: "insensitive" } },
      { university: { contains: searchTerm, mode: "insensitive" } },
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
        volunteer: { select: { name: true, email: true } },
        attendee: {
          select: {
            name: true,
            studentId: true,
            segment: true,
            email: true,
            university: true,
            department: true,
            phone: true,
            semester: true,
            team: true,
            role: true,
          },
        },
      },
    }),
  ]);

  const formattedLogs: FormattedLog[] = rawLogs.map((log) => ({
    id: log.id,
    status: log.status,
    scannedToken: log.scannedToken || "",
    scannedAt: log.scannedAt,
    volunteerName: log.volunteer?.name || null,
    volunteerEmail: log.volunteer?.email || null,
    attendeeName: log.attendee?.name || null,
    attendeeEmail: log.attendee?.email || null,
    studentId: log.attendee?.studentId || null,
    segment: log.attendee?.segment || null,
    university: log.attendee?.university || null,
    department: log.attendee?.department || null,
    phone: log.attendee?.phone || null,
    semester: log.attendee?.semester || null,
    team: log.attendee?.team || null,
    role: log.attendee?.role || null,
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

export const getLogFilterOptions = async (): Promise<{
  categories: { name: string; count: number }[];
  volunteers: { name: string; email: string; count: number }[];
}> => {
  const volunteerLogs = await prisma.scanLog.groupBy({
    by: ["volunteerId"],
    _count: { id: true },
  });

  const users = await prisma.user.findMany({
    where: { id: { in: volunteerLogs.map((v) => v.volunteerId) } },
    select: { id: true, name: true, email: true },
  });

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
    .sort((a, b) => b.count - a.count);

  const attendeeLogs = await prisma.scanLog.groupBy({
    by: ["attendeeId"],
    where: { attendeeId: { not: null } },
    _count: { id: true },
  });

  const attendees = await prisma.attendee.findMany({
    where: {
      id: { in: attendeeLogs.map((a) => a.attendeeId as string) },
    },
    select: { id: true, segment: true },
  });

  const attendeeMap = new Map(attendees.map((a) => [a.id, a.segment]));
  const segmentMap = new Map<string, number>();

  for (const log of attendeeLogs) {
    const segmentName = attendeeMap.get(log.attendeeId as string);
    if (segmentName) {
      const currentCount = segmentMap.get(segmentName) || 0;
      segmentMap.set(segmentName, currentCount + log._count.id);
    }
  }

  const categories = Array.from(segmentMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return { categories, volunteers };
};
