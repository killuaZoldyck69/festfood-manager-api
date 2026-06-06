import { Prisma } from "../../../../prisma/generated/client";
import { prisma } from "../../../lib/prisma";
import { LogFilterOptions, PaginatedLogResponse } from "../types/log.types";

export const getSystemLogs = async (
  page: number,
  limit: number,
  filters: LogFilterOptions,
): Promise<PaginatedLogResponse> => {
  const skip = (page - 1) * limit;
  const whereClause: Prisma.ScanLogWhereInput = {};

  if (filters.status) {
    whereClause.status = filters.status;
  }

  if (filters.search && filters.search.trim() !== "") {
    const searchTerm = filters.search.trim();
    whereClause.attendee = {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
        { studentId: { contains: searchTerm, mode: "insensitive" } },
        { university: { contains: searchTerm, mode: "insensitive" } },
      ],
    };
  }

  const [total, rawLogs] = await Promise.all([
    prisma.scanLog.count({ where: whereClause }),
    prisma.scanLog.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { scannedAt: "desc" },
      include: {
        volunteer: { select: { name: true } },
        attendee: { select: { name: true } },
      },
    }),
  ]);

  const formattedLogs = rawLogs.map((log) => ({
    id: log.id,
    status: log.status,
    scannedToken: log.scannedToken || "",
    scannedAt: log.scannedAt,
    volunteerName: log.volunteer?.name || null,
    attendeeName: log.attendee?.name || null,
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
  volunteers: { name: string; count: number }[];
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

  return { categories, volunteers };
};
