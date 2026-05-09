import { prisma } from "../../lib/prisma";

export const getInventoryStats = async () => {
  // Use Promise.all to execute all 4 database queries simultaneously for maximum speed
  const [logisticsConfig, totalServed, duplicateScans, invalidTickets] =
    await Promise.all([
      // 1. Get the manually set total inventory (ID 1 because it's a singleton table)
      prisma.eventLogistics.findUnique({ where: { id: 1 } }),

      // 2. Count how many people successfully got food
      prisma.attendee.count({ where: { foodClaimed: true } }),

      // 3. Count duplicate scan attempts
      prisma.scanLog.count({ where: { status: "DUPLICATE" } }),

      // 4. Count invalid/fake ticket attempts
      prisma.scanLog.count({ where: { status: "INVALID" } }),
    ]);

  // If the Admin hasn't set the inventory yet, default to 0
  const totalAvailable = logisticsConfig?.totalAvailable || 0;

  return {
    totalAvailable,
    totalServed,
    duplicateScans,
    invalidTickets,
    // Bonus: We can calculate the percentage right here on the backend!
    percentageClaimed:
      totalAvailable > 0 ? Math.round((totalServed / totalAvailable) * 100) : 0,
  };
};
