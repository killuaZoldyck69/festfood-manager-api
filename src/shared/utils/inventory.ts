import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";

export const assertInventoryAvailable = async (): Promise<void> => {
  const logistics = await prisma.eventLogistics.findUnique({
    where: { id: 1 },
  });

  if (!logistics) {
    throw new AppError(400, "Event logistics not initialized.");
  }

  if (logistics.totalAvailable <= 0) {
    throw new AppError(400, "Inventory depleted. No food available.");
  }
};
