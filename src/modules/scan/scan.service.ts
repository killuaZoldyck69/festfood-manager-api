import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { ScanResult } from "./scan.types";
import { logger } from "../../shared/logger";

export const processScan = async (
  qrToken: string,
  volunteerId: string,
): Promise<ScanResult> => {
  let mealType: "BREAKFAST" | "LUNCH" | "OLD" = "OLD";
  let baseToken = qrToken;

  if (qrToken.endsWith("-B")) {
    mealType = "BREAKFAST";
    baseToken = qrToken.slice(0, -2);
  } else if (qrToken.endsWith("-L")) {
    mealType = "LUNCH";
    baseToken = qrToken.slice(0, -2);
  }

  const attendee = await prisma.attendee.findUnique({
    where: { qrToken: baseToken },
  });

  if (!attendee) {
    await prisma.scanLog.create({
      data: {
        status: "INVALID",
        volunteerId,
        scannedToken: qrToken,
        mealType,
      },
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

      let whereClause: any = { id: attendee.id };
      let updateData: any = { claimedAt: new Date() };

      if (mealType === "BREAKFAST") {
        whereClause.breakfastClaimed = false;
        updateData.breakfastClaimed = true;
        updateData.breakfastClaimedAt = new Date();
        updateData.foodClaimed = true; 
      } else if (mealType === "LUNCH") {
        whereClause.lunchClaimed = false;
        updateData.lunchClaimed = true;
        updateData.lunchClaimedAt = new Date();
        updateData.foodClaimed = true;
      } else {
        whereClause.foodClaimed = false;
        updateData.foodClaimed = true;
      }

      const updateResult = await tx.attendee.updateMany({
        where: whereClause,
        data: updateData,
      });

      if (updateResult.count === 0) {
        await tx.scanLog.create({
          data: {
            status: "DUPLICATE",
            volunteerId,
            attendeeId: currentAttendee.id,
            scannedToken: qrToken,
            mealType,
          },
        });
        return { type: "DUPLICATE", attendee: currentAttendee, mealType };
      }

      const logistics = await tx.eventLogistics.findUnique({
        where: { id: 1 },
      });

      const totalBreakfastServed = await tx.attendee.count({ where: { breakfastClaimed: true } });
      const totalLunchServed = await tx.attendee.count({ where: { lunchClaimed: true } });

      if (!logistics) {
        throw new AppError(400, "Event logistics not configured.");
      }

      if (mealType === "BREAKFAST" && totalBreakfastServed > logistics.totalBreakfastAvailable) {
        throw new AppError(400, "Breakfast inventory depleted. No food available.");
      } else if (mealType === "LUNCH" && totalLunchServed > logistics.totalLunchAvailable) {
        throw new AppError(400, "Lunch inventory depleted. No food available.");
      }

      await tx.scanLog.create({
        data: {
          status: "SUCCESS",
          volunteerId,
          attendeeId: currentAttendee.id,
          scannedToken: qrToken,
          mealType,
        },
      });

      const updatedAttendee = await tx.attendee.findUnique({
        where: { id: currentAttendee.id }
      });

      return { type: "SUCCESS", attendee: updatedAttendee!, mealType };
    });

    if (txResult.type === "DUPLICATE") {
      logger.info(
        { attendeeId: attendee.id, volunteerId },
        "Scan failed: Duplicate ticket",
      );
      return {
        status: "DUPLICATE",
        message: `This ${txResult.mealType === 'OLD' ? 'ticket' : txResult.mealType.toLowerCase()} has already been used!`,
        mealType: txResult.mealType,
        attendee: {
          name: txResult.attendee.name,
          email: txResult.attendee.email,
          studentId: txResult.attendee.studentId,
          semester: txResult.attendee.semester,
          team: txResult.attendee.team,
          role: txResult.attendee.role,
          university: txResult.attendee.university,
          segment: txResult.attendee.segment,
          claimedAt: txResult.attendee.claimedAt,
        },
      };
    }

    logger.info(
      { attendeeId: attendee.id, volunteerId },
      "Scan successful: Food claimed",
    );

    const successMessage = txResult.mealType === "OLD" 
      ? "Ticket validated! Serve the food."
      : `Ticket validated! Serve the ${txResult.mealType === "BREAKFAST" ? "Breakfast" : "Lunch"}.`;

    return {
      status: "SUCCESS",
      message: successMessage,
      attendee: txResult.attendee,
      mealType: txResult.mealType,
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
