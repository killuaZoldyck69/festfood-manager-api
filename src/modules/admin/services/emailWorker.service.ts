import { prisma } from "../../../lib/prisma";
import { sendAttendeeTicketEmail } from "./email.service";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let isEmailWorkerRunning = false;

export const startBackgroundEmailBatch = async (): Promise<void> => {
  if (isEmailWorkerRunning) return;
  isEmailWorkerRunning = true;

  try {
    while (isEmailWorkerRunning) {
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

      await delay(5 * 60 * 1000);
    }
  } catch (fatalError) {
    console.error("Fatal error in email worker:", fatalError);
    isEmailWorkerRunning = false;
  }
};

export const stopBackgroundEmailBatch = (): void => {
  isEmailWorkerRunning = false;
};

export const retryFailedEmails = async (): Promise<number> => {
  const result = await prisma.attendee.updateMany({
    where: { emailStatus: "FAILED" },
    data: { emailStatus: "PENDING" },
  });

  if (result.count > 0 && !isEmailWorkerRunning) {
    startBackgroundEmailBatch();
  }

  return result.count;
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
