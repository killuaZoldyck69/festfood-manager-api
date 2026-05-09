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
  ]);

  return {
    status: "SUCCESS",
    message: "Ticket validated! Serve the food.",
    attendee: updatedAttendee,
    code: 200,
  };
};
