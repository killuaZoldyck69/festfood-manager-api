// src/modules/scan/scan.service.ts
import { prisma } from "../../lib/prisma";

export const processScan = async (qrToken: string, volunteerId: string) => {
  const attendee = await prisma.attendee.findUnique({
    where: { qrToken },
  });

  if (!attendee) {
    await prisma.scanLog.create({
      data: { status: "INVALID", volunteerId, scannedToken: qrToken },
    });
    return {
      status: "INVALID",
      message: "Ticket not found or unrecognized.",
      code: 404,
    };
  }

  if (attendee.foodClaimed) {
    await prisma.scanLog.create({
      data: {
        status: "DUPLICATE",
        volunteerId,
        attendeeId: attendee.id,
        scannedToken: qrToken,
      },
    });
    return {
      status: "DUPLICATE",
      message: "This ticket has already been used!",
      attendee: { name: attendee.name, claimedAt: attendee.claimedAt },
      code: 409,
    };
  }

  // 💥 NEW: Strict Inventory Validation 💥
  const logistics = await prisma.eventLogistics.findUnique({
    where: { id: 1 },
  });
  if (!logistics || logistics.totalAvailable <= 0) {
    return {
      status: "DEPLETED",
      message: "Scan failed: No food available in inventory.",
      code: 400, // Bad Request
    };
  }

  const [updatedAttendee, log, logisticsUpdate] = await prisma.$transaction([
    prisma.attendee.update({
      where: { id: attendee.id },
      data: { foodClaimed: true, claimedAt: new Date() },
    }),
    prisma.scanLog.create({
      data: {
        status: "SUCCESS",
        volunteerId,
        attendeeId: attendee.id,
        scannedToken: qrToken,
      },
    }),
    prisma.eventLogistics.updateMany({
      where: { id: 1, totalAvailable: { gt: 0 } },
      data: { totalAvailable: { decrement: 1 } },
    }),
  ]);

  return {
    status: "SUCCESS",
    message: "Ticket validated! Serve the food.",
    attendee: updatedAttendee,
    code: 200,
  };
};
