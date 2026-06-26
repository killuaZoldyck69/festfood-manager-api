import { prisma } from "../../../lib/prisma";
import { sendAttendeeTicketEmail } from "./email.service";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let isEmailWorkerRunning = false;

export const startBackgroundEmailBatch = async (): Promise<void> => {
  if (isEmailWorkerRunning) return;
  isEmailWorkerRunning = true;

  try {
    while (true) {
      const nextAttendee = await prisma.attendee.findFirst({
        where: { emailStatus: "PENDING" },
      });

      if (!nextAttendee) {
        isEmailWorkerRunning = false;
        break;
      }

      try {
        await sendAttendeeTicketEmail(nextAttendee.id);

        await prisma.attendee.update({
          where: { id: nextAttendee.id },
          data: { emailStatus: "SENT" },
        });
      } catch (error) {
        console.error(`Failed to email ${nextAttendee.email}:`, error);

        await prisma.attendee.update({
          where: { id: nextAttendee.id },
          data: { emailStatus: "FAILED" },
        });
      }

      await delay(60000);
    }
  } catch (fatalError) {
    console.error("Fatal error in email worker:", fatalError);
    isEmailWorkerRunning = false;
  }
};

export const getEmailProgressStats = async () => {
  const [pending, sent, failed, total] = await Promise.all([
    prisma.attendee.count({ where: { emailStatus: "PENDING" } }),
    prisma.attendee.count({ where: { emailStatus: "SENT" } }),
    prisma.attendee.count({ where: { emailStatus: "FAILED" } }),
    prisma.attendee.count(),
  ]);

  return {
    isRunning: isEmailWorkerRunning,
    pending,
    sent,
    failed,
    total,
    progressPercentage:
      total === 0 ? 0 : Math.round(((sent + failed) / total) * 100),
  };
};
