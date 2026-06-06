import { Prisma } from "../../../prisma/generated/client";
import { ScanStatus } from "../../../prisma/generated/enums";
import { prisma } from "../../lib/prisma";
import { PaginatedVolunteerLogs } from "./volunteer.types";

export const getVolunteerLogs = async (
  volunteerId: string,
  page: number,
  limit: number,
  status?: ScanStatus,
): Promise<PaginatedVolunteerLogs> => {
  const skip = (page - 1) * limit;

  const whereClause: Prisma.ScanLogWhereInput = { volunteerId };

  if (status) {
    whereClause.status = status;
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
          select: { name: true, university: true, category: true },
        },
      },
    }),
  ]);

  const formattedLogs = rawLogs.map((log) => ({
    id: log.id,
    status: log.status,
    scannedToken: log.scannedToken || "", // Fallback to satisfy strict string type
    scannedAt: log.scannedAt,
    attendeeName: log.attendee?.name || null,
    attendeeUniversity: log.attendee?.university || null,
    attendeeCategory: log.attendee?.category || null,
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
