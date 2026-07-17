import { prisma } from "../../lib/prisma";
import { InventoryStats, SystemHealth } from "./inventory.types";

export const getInventoryStats = async (): Promise<InventoryStats> => {
  const [
    logisticsConfig,
    totalBreakfastServed,
    totalLunchServed,
    duplicateScans,
    invalidTickets,
    totalParticipants,
  ] = await Promise.all([
    prisma.eventLogistics.findUnique({ where: { id: 1 } }),
    prisma.attendee.count({ where: { breakfastClaimed: true } }),
    prisma.attendee.count({ where: { lunchClaimed: true } }),
    prisma.scanLog.count({ where: { status: "DUPLICATE" } }),
    prisma.scanLog.count({ where: { status: "INVALID" } }),
    prisma.attendee.count(),
  ]);

  const totalServed = totalBreakfastServed + totalLunchServed;

  const totalBreakfastAvailable = logisticsConfig?.totalBreakfastAvailable || 0;
  const totalLunchAvailable = logisticsConfig?.totalLunchAvailable || 0;

  return {
    totalBreakfastAvailable,
    totalLunchAvailable,
    totalServed,
    totalBreakfastServed,
    totalLunchServed,
    totalParticipants,
    duplicateScans,
    invalidTickets,
    percentageClaimed:
      totalBreakfastAvailable > 0 && totalLunchAvailable > 0
        ? Math.round((totalServed / (totalBreakfastAvailable + totalLunchAvailable)) * 100)
        : 0,
    breakfastPercentageClaimed:
      totalBreakfastAvailable > 0 ? Math.round((totalBreakfastServed / totalBreakfastAvailable) * 100) : 0,
    lunchPercentageClaimed:
      totalLunchAvailable > 0 ? Math.round((totalLunchServed / totalLunchAvailable) * 100) : 0,
  };
};

export const getSystemHealth = async (): Promise<SystemHealth> => {
  const start = Date.now();
  let dbStatus: "up" | "down" = "down";

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "up";
  } catch (error) {
    dbStatus = "down";
  }

  const latencyMs = Date.now() - start;
  const memoryUsage = process.memoryUsage();

  return {
    database: {
      status: dbStatus,
      latencyMs,
    },
    memory: {
      heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    },
    uptime: Math.round(process.uptime()),
    version: process.env.npm_package_version || "1.0.0",
  };
};
