import { prisma } from "../../lib/prisma";
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

  try {
    const txResult = await prisma.$transaction(async (tx) => {
      const currentAttendee = await tx.attendee.findUnique({
        where: { id: attendee.id },
      });

      if (!currentAttendee) {
        throw new AppError(404, "Attendee record is missing.");
      }

      if (currentAttendee.foodClaimed) {
        await tx.scanLog.create({
          data: {
            status: "DUPLICATE",
            volunteerId,
            attendeeId: currentAttendee.id,
            scannedToken: qrToken,
          },
        });
        return { type: "DUPLICATE", attendee: currentAttendee };
      }

      const logistics = await tx.eventLogistics.findUnique({
        where: { id: 1 },
      });

      if (!logistics || logistics.totalAvailable <= 0) {
        throw new AppError(400, "Inventory depleted. No food available.");
      }

      await tx.eventLogistics.update({
        where: { id: 1 },
        data: { totalAvailable: { decrement: 1 } },
      });

      await tx.scanLog.create({
        data: {
          status: "SUCCESS",
          volunteerId,
          attendeeId: currentAttendee.id,
          scannedToken: qrToken,
        },
      });

      const updatedAttendee = await tx.attendee.update({
        where: { id: currentAttendee.id },
        data: { foodClaimed: true, claimedAt: new Date() },
      });

      return { type: "SUCCESS", attendee: updatedAttendee };
    });

    if (txResult.type === "DUPLICATE") {
      logger.info(
        { attendeeId: attendee.id, volunteerId },
        "Scan failed: Duplicate ticket",
      );
      return {
        status: "DUPLICATE",
        message: "This ticket has already been used!",
        attendee: {
          name: txResult.attendee.name,
          email: txResult.attendee.email,
          studentId: txResult.attendee.studentId,
          semester: txResult.attendee.semester,
          section: txResult.attendee.section,
          university: txResult.attendee.university,
          category: txResult.attendee.category,
          claimedAt: txResult.attendee.claimedAt,
        },
      };
    }

    logger.info(
      { attendeeId: attendee.id, volunteerId },
      "Scan successful: Food claimed",
    );

    return {
      status: "SUCCESS",
      message: "Ticket validated! Serve the food.",
      attendee: txResult.attendee,
    };
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(
        { attendeeId: attendee.id, volunteerId },
        `Scan failed: ${error.message}`,
      );
      return { status: "DEPLETED", message: error.message };
    }

    logger.error({ error, attendeeId: attendee.id }, "Transaction failed");
    throw error;
  }
};
