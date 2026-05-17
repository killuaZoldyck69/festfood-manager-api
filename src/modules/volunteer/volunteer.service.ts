import { Prisma, ScanStatus } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export const getVolunteerLogs = async (
  volunteerId: string,
  page: number,
  limit: number,
  status?: ScanStatus,
) => {
  const skip = (page - 1) * limit;

  const whereClause: Prisma.ScanLogWhereInput = { volunteerId };

  if (status) {
    whereClause.status = status;
  }

  const [totalLogs, rawLogs] = await Promise.all([
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
    scannedToken: log.scannedToken,
    scannedAt: log.scannedAt,
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
    },
    logs: formattedLogs,
  };
};
