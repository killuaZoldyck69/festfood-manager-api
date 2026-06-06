import { prisma } from "../../lib/prisma";
import { assertInventoryAvailable } from "../../shared/utils/inventory";
import { AppError } from "../../errors/AppError";
import { ScanResult } from "./scan.types";
import { logger } from "../../shared/logger";

export const processScan = async (
  qrToken: string,
  volunteerId: string,
): Promise<ScanResult> => {
  const attendee = await prisma.attendee.findUnique({
    where: { qrToken },
  });

  if (!attendee) {
    await prisma.scanLog.create({
      data: { status: "INVALID", volunteerId, scannedToken: qrToken },
    });
    logger.info({ qrToken, volunteerId }, "Scan failed: Invalid token");
    return {
      status: "INVALID",
      message: "Ticket not found or unrecognized.",
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
    logger.info(
      { attendeeId: attendee.id, volunteerId },
      "Scan failed: Duplicate ticket",
    );
    return {
      status: "DUPLICATE",
      message: "This ticket has already been used!",
      attendee: { name: attendee.name, claimedAt: attendee.claimedAt },
    };
  }

  try {
    await assertInventoryAvailable();
  } catch (error) {
    const message =
      error instanceof AppError ? error.message : "Inventory depleted.";
    logger.warn(
      { attendeeId: attendee.id, volunteerId },
      "Scan failed: Depleted inventory",
    );
    return { status: "DEPLETED", message };
  }

  const [updatedAttendee] = await prisma.$transaction([
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

  logger.info(
    { attendeeId: attendee.id, volunteerId },
    "Scan successful: Food claimed",
  );

  return {
    status: "SUCCESS",
    message: "Ticket validated! Serve the food.",
    attendee: updatedAttendee,
  };
};
