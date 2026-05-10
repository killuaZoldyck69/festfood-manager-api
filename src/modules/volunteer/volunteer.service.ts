import { ScanStatus } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

export const getVolunteerLogs = async (
  volunteerId: string,
  page: number,
  limit: number,
  status?: ScanStatus, // We type this to match Prisma's exact enum
) => {
  const skip = (page - 1) * limit;

  // Build the dynamic where clause
  // We strictly lock this to the logged-in volunteer's ID
  const whereClause: any = { volunteerId };

  // If the mobile app sent a specific status filter, add it to the query
  if (status) {
    whereClause.status = status;
  }

  // Run the count and fetch simultaneously
  const [totalLogs, rawLogs] = await Promise.all([
    prisma.scanLog.count({ where: whereClause }),
    prisma.scanLog.findMany({
      where: whereClause,
      skip: skip,
      take: limit,
      orderBy: { scannedAt: "desc" }, // Newest scans at the top
      include: {
        attendee: {
          select: { name: true, university: true, category: true },
        },
      },
    }),
  ]);

  // Flatten the response for the frontend
  const formattedLogs = rawLogs.map((log) => ({
    id: log.id,
    status: log.status,
    scannedToken: log.scannedToken,
    scannedAt: log.scannedAt,
    // Include attendee info if it was a valid scan, otherwise return null
    attendeeName: log.attendee?.name || null,
    attendeeUniversity: log.attendee?.university || null,
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
