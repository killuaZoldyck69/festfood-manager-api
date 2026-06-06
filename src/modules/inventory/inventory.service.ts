import { prisma } from "../../lib/prisma";
import { InventoryStats, SystemHealth } from "./inventory.types";

export const getInventoryStats = async (): Promise<InventoryStats> => {
  const [
    logisticsConfig,
    totalServed,
    duplicateScans,
    invalidTickets,
    totalParticipants,
  ] = await Promise.all([
    prisma.eventLogistics.findUnique({ where: { id: 1 } }),
    prisma.attendee.count({ where: { foodClaimed: true } }),
    prisma.scanLog.count({ where: { status: "DUPLICATE" } }),
    prisma.scanLog.count({ where: { status: "INVALID" } }),
    prisma.attendee.count(),
  ]);

  const totalAvailable = logisticsConfig?.totalAvailable || 0;

  return {
    totalAvailable,
    totalServed,
    totalParticipants,
    duplicateScans,
    invalidTickets,
    percentageClaimed:
      totalAvailable > 0 ? Math.round((totalServed / totalAvailable) * 100) : 0,
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
