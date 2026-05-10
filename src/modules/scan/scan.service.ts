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

  // 💥 THE FIX IS HERE 💥
  // We add the EventLogistics update to the transaction array
  const [updatedAttendee, log, logisticsUpdate] = await prisma.$transaction([
    // 1. Mark the food as claimed
    prisma.attendee.update({
      where: { id: attendee.id },
      data: { foodClaimed: true, claimedAt: new Date() },
    }),
    // 2. Create the success audit log
    prisma.scanLog.create({
      data: {
        status: "SUCCESS",
        volunteerId,
        attendeeId: attendee.id,
        scannedToken: qrToken,
      },
    }),
    // 3. Decrease the Total Available inventory by 1
    // We use updateMany so it doesn't crash if the Admin hasn't set the inventory yet
    prisma.eventLogistics.updateMany({
      where: { id: 1, totalAvailable: { gt: 0 } }, // Only decrement if greater than 0
      data: {
        totalAvailable: {
          decrement: 1,
        },
      },
    }),
  ]);

  return {
    status: "SUCCESS",
    message: "Ticket validated! Serve the food.",
    attendee: updatedAttendee,
    code: 200,
  };
};
