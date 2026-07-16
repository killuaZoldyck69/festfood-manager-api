import { prisma } from "../../../lib/prisma";

export const updateLogisticsInventory = async (
  totalBreakfastAvailable: number,
  totalLunchAvailable: number,
): Promise<void> => {
  await prisma.eventLogistics.upsert({
    where: { id: 1 },
    update: { totalBreakfastAvailable, totalLunchAvailable },
    create: { id: 1, totalBreakfastAvailable, totalLunchAvailable },
  });
};

export const resetEventInventory = async (): Promise<void> => {
  await prisma.eventLogistics.upsert({
    where: { id: 1 },
    update: { totalBreakfastAvailable: 0, totalLunchAvailable: 0 },
    create: { id: 1, totalBreakfastAvailable: 0, totalLunchAvailable: 0 },
  });
};
